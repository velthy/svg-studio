import { useCallback, useRef, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/Header'
import { DropZone } from '@/components/DropZone'
import { OptionsPanel } from '@/components/OptionsPanel'
import { Preview } from '@/components/Preview'
import { CodeView } from '@/components/CodeView'
import { SplitView } from '@/components/SplitView'
import { SizeComparison } from '@/components/SizeComparison'
import { ExportPanel } from '@/components/ExportPanel'
import { useTheme } from '@/hooks/useTheme'
import { useSvgoWorker } from '@/hooks/useSvgoWorker'
import { getDefaultPluginStates, PLUGINS } from '@/lib/svgo-config'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function App() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { optimizedSvg, isOptimizing, error, optimize } = useSvgoWorker()

  const [originalSvg, setOriginalSvg] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | undefined>()
  const [pluginStates, setPluginStates] = useState<Record<string, boolean>>(getDefaultPluginStates)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const triggerOptimize = useCallback((svg: string, states: Record<string, boolean>) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      optimize(svg, states)
    }, 150)
  }, [optimize])

  const handleSvgInput = useCallback((svg: string, name?: string) => {
    setOriginalSvg(svg)
    setFilename(name)
    triggerOptimize(svg, pluginStates)
  }, [pluginStates, triggerOptimize])

  const handlePluginToggle = useCallback((pluginId: string, enabled: boolean) => {
    setPluginStates(prev => {
      const next = { ...prev, [pluginId]: enabled }
      if (originalSvg) triggerOptimize(originalSvg, next)
      return next
    })
  }, [originalSvg, triggerOptimize])

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaultPluginStates()
    setPluginStates(defaults)
    if (originalSvg) triggerOptimize(originalSvg, defaults)
  }, [originalSvg, triggerOptimize])

  const handleEnableAll = useCallback(() => {
    const all: Record<string, boolean> = {}
    for (const p of PLUGINS) all[p.id] = true
    setPluginStates(all)
    if (originalSvg) triggerOptimize(originalSvg, all)
  }, [originalSvg, triggerOptimize])

  const handleDisableAll = useCallback(() => {
    const none: Record<string, boolean> = {}
    for (const p of PLUGINS) none[p.id] = false
    setPluginStates(none)
    if (originalSvg) triggerOptimize(originalSvg, none)
  }, [originalSvg, triggerOptimize])

  const handleReset = useCallback(() => {
    setOriginalSvg(null)
    setFilename(undefined)
  }, [])

  const originalSize = originalSvg ? new Blob([originalSvg]).size : 0
  const optimizedSize = optimizedSvg ? new Blob([optimizedSvg]).size : 0

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />

        {!originalSvg ? (
          <main className="flex-1 flex items-center justify-center">
            <DropZone onSvgInput={handleSvgInput} />
          </main>
        ) : (
          <main className="flex-1 flex overflow-hidden min-h-0">
            {/* Options Sidebar */}
            <aside className="w-72 border-r flex flex-col shrink-0 min-h-0">
              <OptionsPanel
                pluginStates={pluginStates}
                onPluginToggle={handlePluginToggle}
                onResetDefaults={handleResetDefaults}
                onEnableAll={handleEnableAll}
                onDisableAll={handleDisableAll}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium truncate">
                    {filename || 'Pasted SVG'}
                  </span>
                  {isOptimizing && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <ExportPanel svg={optimizedSvg} filename={filename} />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
                {/* Size comparison */}
                {optimizedSvg && (
                  <SizeComparison
                    originalSize={originalSize}
                    optimizedSize={optimizedSize}
                  />
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Code + Preview split */}
                <SplitView
                  top={<CodeView code={optimizedSvg} />}
                  bottom={<Preview svg={optimizedSvg} className="h-full" />}
                />
              </div>
            </div>
          </main>
        )}
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
