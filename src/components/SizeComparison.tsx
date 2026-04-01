import { formatBytes, calculateSavings } from '@/lib/utils'

interface SizeComparisonProps {
  originalSize: number
  optimizedSize: number
}

export function SizeComparison({ originalSize, optimizedSize }: SizeComparisonProps) {
  const savings = calculateSavings(originalSize, optimizedSize)
  const ratio = originalSize > 0 ? (optimizedSize / originalSize) * 100 : 100

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Original</span>
          <span className="text-sm font-medium">{formatBytes(originalSize)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Optimized</span>
          <span className="text-sm font-medium">{formatBytes(optimizedSize)}</span>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${ratio}%` }}
        />
      </div>

      <p className="text-center text-sm">
        {savings > 0 ? (
          <>
            <span className="font-semibold text-primary">{savings}% smaller</span>
            <span className="text-muted-foreground"> — saved {formatBytes(originalSize - optimizedSize)}</span>
          </>
        ) : (
          <span className="text-muted-foreground">No size reduction</span>
        )}
      </p>
    </div>
  )
}
