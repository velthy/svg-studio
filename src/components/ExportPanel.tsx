import { useState, useCallback } from 'react'
import { Download, Copy, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EXPORT_OPTIONS, formatSvgForExport, type ExportFormat } from '@/lib/export-formats'

interface ExportPanelProps {
  svg: string | null
  filename?: string
}

export function ExportPanel({ svg, filename }: ExportPanelProps) {
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null)

  const handleDownload = useCallback(() => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename?.replace(/\.svg$/, '') + '-optimized.svg' || 'optimized.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [svg, filename])

  const handleCopy = useCallback(async (format: ExportFormat) => {
    if (!svg) return
    const text = formatSvgForExport(svg, format)
    await navigator.clipboard.writeText(text)
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2000)
  }, [svg])

  if (!svg) return null

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download SVG
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            {copiedFormat ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy as...
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {EXPORT_OPTIONS.map(option => (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleCopy(option.id)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
