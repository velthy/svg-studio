import { useCallback, useRef, useState } from 'react'
import { Upload, ClipboardPaste } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { processSvgFiles, MAX_FILES, type SvgInput } from '@/lib/svg-files'

export type { SvgInput } from '@/lib/svg-files'

interface DropZoneProps {
  /** Called for one or more uploaded SVGs (drop/file picker). */
  onSvgsInput: (inputs: SvgInput[]) => void
  /** Called for pasted SVG code (single only). */
  onPasteInput: (svg: string) => void
}

export function DropZone({ onSvgsInput, onPasteInput }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const valid = await processSvgFiles(fileList, 0)
    if (valid.length > 0) onSvgsInput(valid)
  }, [onSvgsInput])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handlePasteSubmit = useCallback(() => {
    if (pasteValue.trim() && pasteValue.includes('<svg')) {
      onPasteInput(pasteValue.trim())
      setPasteValue('')
      setShowPaste(false)
    }
  }, [pasteValue, onPasteInput])

  const handleGlobalPaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text')
    if (text && text.includes('<svg')) {
      e.preventDefault()
      onPasteInput(text.trim())
    }
  }, [onPasteInput])

  if (showPaste) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 w-full max-w-2xl mx-auto">
        <textarea
          className="w-full h-64 rounded-lg border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Paste your SVG code here..."
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <Button onClick={handlePasteSubmit} disabled={!pasteValue.includes('<svg')}>
            Optimize
          </Button>
          <Button variant="outline" onClick={() => { setShowPaste(false); setPasteValue('') }}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-8 w-full"
      onPaste={handleGlobalPaste}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full max-w-xl rounded-2xl border-2 border-dashed p-16
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-300 ease-out
          ${isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50'
          }
        `}
      >
        <div className={`
          rounded-full p-4 transition-all duration-300
          ${isDragOver ? 'bg-primary/10 scale-110' : 'bg-muted'}
        `}>
          <Upload className={`h-8 w-8 transition-colors duration-300 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="text-center">
          <p className="text-base font-medium">
            Drop your SVG file(s) here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse — up to {MAX_FILES} files
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex items-center gap-6 mt-6">
        <div className="h-px w-16 bg-border" />
        <span className="text-sm text-muted-foreground">or</span>
        <div className="h-px w-16 bg-border" />
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setShowPaste(true)}>
          <ClipboardPaste className="mr-2 h-4 w-4" />
          Paste SVG Code
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Paste SVG code directly with Ctrl+V / Cmd+V (single file only)
      </p>
    </div>
  )
}
