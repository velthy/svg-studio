import { useMemo } from 'react'

interface PreviewProps {
  svg: string | null
  className?: string
}

export function Preview({ svg, className = '' }: PreviewProps) {
  const blobUrl = useMemo(() => {
    if (!svg) return null
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    return URL.createObjectURL(blob)
  }, [svg])

  if (!svg) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-dashed bg-muted/30 ${className}`}>
        <p className="text-sm text-muted-foreground">No SVG to preview</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg border bg-[repeating-conic-gradient(#d4d4d4_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] overflow-hidden ${className}`}>
      <img
        src={blobUrl ?? undefined}
        alt="SVG Preview"
        className="w-full h-full object-contain p-4"
      />
    </div>
  )
}
