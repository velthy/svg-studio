import { useCallback, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ColorInfo } from '@/lib/colors'

interface ColorPaletteProps {
  colors: ColorInfo[]
  overrides: Record<string, string>
  onColorChange: (originalNormalized: string, newColor: string) => void
  onReset: () => void
}

export function ColorPalette({ colors, overrides, onColorChange, onReset }: ColorPaletteProps) {
  if (colors.length === 0) return null

  const hasOverrides = Object.keys(overrides).length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Colors ({colors.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 px-2 text-xs transition-opacity ${hasOverrides ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onReset}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map(color => (
          <ColorSwatch
            key={color.normalized}
            color={color}
            currentColor={overrides[color.normalized] ?? color.normalized}
            onChange={(newColor) => onColorChange(color.normalized, newColor)}
          />
        ))}
      </div>
    </div>
  )
}

interface ColorSwatchProps {
  color: ColorInfo
  currentColor: string
  onChange: (newColor: string) => void
}

function ColorSwatch({ color, currentColor, onChange }: ColorSwatchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const isModified = currentColor !== color.normalized

  return (
    <button
      onClick={handleClick}
      className={`
        group relative flex items-center gap-2 rounded-md border px-2 py-1.5
        transition-colors hover:bg-muted/50
        ${isModified ? 'border-primary/50 bg-primary/5' : 'border-border'}
      `}
      title={`${color.original} (${color.count}x) — click to change`}
    >
      <div
        className="h-5 w-5 rounded border border-border/50 shrink-0"
        style={{ backgroundColor: currentColor }}
      />
      <span className="text-xs font-mono text-muted-foreground">
        {currentColor}
      </span>
      <span className="text-[10px] text-muted-foreground/60">
        {color.count}x
      </span>
      <input
        ref={inputRef}
        type="color"
        value={currentColor}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        tabIndex={-1}
      />
    </button>
  )
}
