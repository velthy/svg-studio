import { useCallback, useState } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export interface UseHistoryResult<T> {
  state: T
  set: (next: T | ((prev: T) => T)) => void
  /** Replace present without creating a history entry. Use for non-user-facing state corrections. */
  replace: (next: T | ((prev: T) => T)) => void
  /** Drop past/future and set the present — equivalent to remounting with a new initial value. */
  reset: (value: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

/**
 * Classic past/present/future undo/redo stack.
 * `set` adds a new entry and clears any redo branch.
 */
export function useHistory<T>(initial: T): UseHistoryResult<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  })

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setHistory(({ past, present }) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(present) : next
      if (Object.is(value, present)) return { past, present, future: [] }
      return { past: [...past, present], present: value, future: [] }
    })
  }, [])

  const replace = useCallback((next: T | ((prev: T) => T)) => {
    setHistory(({ past, present, future }) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(present) : next
      return { past, present: value, future }
    })
  }, [])

  const reset = useCallback((value: T) => {
    setHistory({ past: [], present: value, future: [] })
  }, [])

  const undo = useCallback(() => {
    setHistory(({ past, present, future }) => {
      if (past.length === 0) return { past, present, future }
      const prev = past[past.length - 1]
      return {
        past: past.slice(0, -1),
        present: prev,
        future: [present, ...future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(({ past, present, future }) => {
      if (future.length === 0) return { past, present, future }
      const next = future[0]
      return {
        past: [...past, present],
        present: next,
        future: future.slice(1),
      }
    })
  }, [])

  return {
    state: history.present,
    set,
    replace,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
