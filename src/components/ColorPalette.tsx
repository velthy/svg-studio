import { useCallback, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

  const handlePickerClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const isCurrentColor = currentColor === 'currentColor'
  const isModified = currentColor !== color.normalized

  const handleToggleCurrentColor = useCallback(() => {
    onChange(isCurrentColor ? color.normalized : 'currentColor')
  }, [isCurrentColor, color.normalized, onChange])

  return (
    <div
      className={cn(
        'group relative flex items-center rounded-md border overflow-hidden transition-colors',
        isModified ? 'border-primary/50 bg-primary/5' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={handlePickerClick}
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 transition-colors"
        title={`${color.original} (${color.count}x) — click to change`}
      >
        <div
          className={cn(
            'relative h-5 w-5 rounded border border-border/50 shrink-0 overflow-hidden',
            isCurrentColor && 'bg-[repeating-linear-gradient(45deg,var(--muted-foreground)_0_2px,transparent_2px_5px)]',
          )}
          style={isCurrentColor ? undefined : { backgroundColor: currentColor }}
        />
        <span className="text-xs font-mono text-muted-foreground">
          {isCurrentColor ? 'currentColor' : currentColor}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {color.count}x
        </span>
        <input
          ref={inputRef}
          type="color"
          value={isCurrentColor ? color.normalized : currentColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </button>
      <button
        type="button"
        onClick={handleToggleCurrentColor}
        className={cn(
          'h-full px-2 py-1.5 border-l text-[10px] font-mono font-medium transition-colors',
          isCurrentColor
            ? 'bg-primary/10 text-primary border-primary/30'
            : 'text-muted-foreground/60 hover:bg-muted/50 hover:text-foreground',
        )}
        title={isCurrentColor ? 'Reset to original color' : 'Use currentColor (inherits from CSS)'}
      >
        CC
      </button>
    </div>
  )
}
