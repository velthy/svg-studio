import { useCallback, useState } from 'react'

const STORAGE_KEY = 'svg-studio-optimized-suffix'

export function useDownloadSettings() {
  // Default on: keeps today's behaviour (`name-optimized.svg`) for existing users.
  const [optimizedSuffix, setOptimizedSuffixState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false'
    } catch {
      return true
    }
  })

  const setOptimizedSuffix = useCallback((next: boolean) => {
    setOptimizedSuffixState(next)
    try {
      if (next) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, 'false')
    } catch {
      // Storage unavailable — the setting just won't persist.
    }
  }, [])

  return { optimizedSuffix, setOptimizedSuffix }
}
