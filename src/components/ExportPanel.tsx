import { useState, useCallback } from 'react'
import { Download, Copy, Check, ChevronDown, FileArchive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EXPORT_OPTIONS, formatSvgForExport, type ExportFormat } from '@/lib/export-formats'
import { downloadZip, optimizedFilename, type ZipItem } from '@/lib/bulk-export'
import { toast } from 'sonner'

interface ExportPanelProps {
  /** Single-file mode: provide svg + filename. */
  svg?: string | null
  filename?: string
  /** Bulk mode: provide an array of items. Triggers ZIP download. */
  bulkItems?: { svg: string; filename: string }[]
}

export function ExportPanel({ svg, filename, bulkItems }: ExportPanelProps) {
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null)
  const [zipping, setZipping] = useState(false)

  const handleDownload = useCallback(() => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ? optimizedFilename(filename) : 'optimized.svg'
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

  const handleDownloadZip = useCallback(async () => {
    if (!bulkItems || bulkItems.length === 0) return
    setZipping(true)
    try {
      const zipItems: ZipItem[] = bulkItems.map(item => ({
        filename: optimizedFilename(item.filename),
        content: item.svg,
      }))
      await downloadZip(zipItems)
    } catch (err) {
      toast.error(`ZIP download failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setZipping(false)
    }
  }, [bulkItems])

  if (bulkItems && bulkItems.length > 0) {
    return (
      <Button onClick={handleDownloadZip} disabled={zipping} className="gap-2">
        <FileArchive className="h-4 w-4" />
        {zipping ? 'Packing…' : `Download all (${bulkItems.length})`}
      </Button>
    )
  }

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
