import { useCallback, useEffect, useRef, useState } from 'react'
import { buildSvgoConfig } from '@/lib/svgo-config'

interface UseSvgoWorkerResult {
  optimizedSvg: string | null
  isOptimizing: boolean
  error: string | null
  optimize: (svg: string, pluginStates: Record<string, boolean>) => void
}

export function useSvgoWorker(): UseSvgoWorkerResult {
  const workerRef = useRef<Worker | null>(null)
  const messageIdRef = useRef(0)
  const [optimizedSvg, setOptimizedSvg] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/svgo.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker

    worker.onmessage = (e) => {
      const { success, data, error: errMsg } = e.data
      setIsOptimizing(false)
      if (success) {
        setOptimizedSvg(data)
        setError(null)
      } else {
        setError(errMsg)
      }
    }

    worker.onerror = (err) => {
      setIsOptimizing(false)
      setError(err.message)
    }

    return () => {
      worker.terminate()
    }
  }, [])

  const optimizeFn = useCallback((svg: string, pluginStates: Record<string, boolean>) => {
    if (!workerRef.current || !svg.trim()) return

    const id = ++messageIdRef.current
    setIsOptimizing(true)
    setError(null)

    const config = buildSvgoConfig(pluginStates)
    workerRef.current.postMessage({ id, svg, config })
  }, [])

  return { optimizedSvg, isOptimizing, error, optimize: optimizeFn }
}
