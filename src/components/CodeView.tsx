import { useCallback, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeViewProps {
  code: string | null
}

export function CodeView({ code }: CodeViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg border border-dashed bg-muted/30">
        <p className="text-sm text-muted-foreground">Optimized code will appear here</p>
      </div>
    )
  }

  return (
    <div className="relative h-full rounded-lg border bg-muted/30 overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="h-full overflow-auto p-4 text-xs font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
