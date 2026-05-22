import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'svg-studio-primary-color'

export const PRESET_PRIMARY_COLORS = [
  '#e0400d',
  '#df1279',
  '#ad0af8',
  '#0c77ff',
  '#3ea525',
  '#da7500',
] as const

// White reads well on every preset and on most user-chosen saturated colors.
const CUSTOM_FOREGROUND = '#ffffff'

function applyPrimary(color: string | null) {
  const root = document.documentElement
  if (color) {
    root.style.setProperty('--primary', color)
    root.style.setProperty('--primary-foreground', CUSTOM_FOREGROUND)
  } else {
    root.style.removeProperty('--primary')
    root.style.removeProperty('--primary-foreground')
  }
}

function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

export function usePrimaryColor() {
  const [color, setColorState] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && isValidHex(stored) ? stored : null
  })

  const setColor = useCallback((next: string | null) => {
    if (next !== null && !isValidHex(next)) return
    setColorState(next)
    if (next) localStorage.setItem(STORAGE_KEY, next)
    else localStorage.removeItem(STORAGE_KEY)
    applyPrimary(next)
  }, [])

  useEffect(() => {
    applyPrimary(color)
  }, [color])

  return { color, setColor }
}
