import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeView } from '@/components/CodeView'
import { Preview } from '@/components/Preview'
import { SizeComparison } from '@/components/SizeComparison'
import { ExportPanel } from '@/components/ExportPanel'
import { formatBytes } from '@/lib/utils'

interface DetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  displaySvg: string | null
  originalSize: number
  optimizedSize: number
}

export function DetailSheet({
  open,
  onOpenChange,
  filename,
  displaySvg,
  originalSize,
  optimizedSize,
}: DetailSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col gap-0 border-l bg-background shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right"
        >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex flex-col min-w-0">
              <Dialog.Title className="text-sm font-medium truncate" title={filename}>
                {filename}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground">
                {formatBytes(optimizedSize)} — original {formatBytes(originalSize)}
              </Dialog.Description>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ExportPanel svg={displaySvg} filename={filename} />
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-hidden p-4 flex-1 min-h-0">
            <SizeComparison originalSize={originalSize} optimizedSize={optimizedSize} />
            <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
              <CodeView code={displaySvg} />
              <Preview svg={displaySvg} className="h-full" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
