import { useCallback, useEffect, useRef } from 'react'
import { buildSvgoConfig } from '@/lib/svgo-config'

export interface OptimizeJob {
  id: string
  svg: string
}

export interface SvgoQueueCallbacks {
  onResult: (id: string, optimizedSvg: string) => void
  onError: (id: string, error: string) => void
  onStart: (id: string) => void
  onDone: () => void
}

interface UseSvgoQueueResult {
  optimizeMany: (jobs: OptimizeJob[], pluginStates: Record<string, boolean>) => void
  cancel: () => void
}

export function useSvgoQueue(callbacks: SvgoQueueCallbacks): UseSvgoQueueResult {
  const workerRef = useRef<Worker | null>(null)
  const epochRef = useRef(0)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const queueRef = useRef<{ epoch: number; jobs: OptimizeJob[]; index: number; config: ReturnType<typeof buildSvgoConfig> } | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/svgo.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.onmessage = (e) => {
      const { id: msgId, success, data, error: errMsg } = e.data
      const queue = queueRef.current
      if (!queue) return

      const [epochStr, jobId] = String(msgId).split('|')
      if (Number(epochStr) !== queue.epoch) return // stale response

      if (success) {
        callbacksRef.current.onResult(jobId, data)
      } else {
        callbacksRef.current.onError(jobId, errMsg ?? 'Unknown error')
      }

      queue.index++
      if (queue.index < queue.jobs.length) {
        runNext()
      } else {
        callbacksRef.current.onDone()
      }
    }

    worker.onerror = (err) => {
      const queue = queueRef.current
      if (!queue) return
      const job = queue.jobs[queue.index]
      if (job) callbacksRef.current.onError(job.id, err.message)
      queue.index++
      if (queue.index < queue.jobs.length) {
        runNext()
      } else {
        callbacksRef.current.onDone()
      }
    }

    return () => {
      worker.terminate()
    }
  }, [])

  const runNext = useCallback(() => {
    const queue = queueRef.current
    const worker = workerRef.current
    if (!queue || !worker) return
    const job = queue.jobs[queue.index]
    if (!job) return
    callbacksRef.current.onStart(job.id)
    worker.postMessage({
      id: `${queue.epoch}|${job.id}`,
      svg: job.svg,
      config: queue.config,
    })
  }, [])

  const cancel = useCallback(() => {
    epochRef.current++
    queueRef.current = null
  }, [])

  const optimizeMany = useCallback((jobs: OptimizeJob[], pluginStates: Record<string, boolean>) => {
    if (jobs.length === 0) return
    epochRef.current++
    queueRef.current = {
      epoch: epochRef.current,
      jobs,
      index: 0,
      config: buildSvgoConfig(pluginStates),
    }
    runNext()
  }, [runNext])

  return { optimizeMany, cancel }
}
