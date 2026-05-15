import { useCallback, useMemo, useRef, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/Header'
import { DropZone, type SvgInput } from '@/components/DropZone'
import { OptionsPanel } from '@/components/OptionsPanel'
import { Preview } from '@/components/Preview'
import { CodeView } from '@/components/CodeView'
import { SplitView } from '@/components/SplitView'
import { SizeComparison } from '@/components/SizeComparison'
import { ExportPanel } from '@/components/ExportPanel'
import { ColorPalette } from '@/components/ColorPalette'
import { ThumbnailGrid, type ThumbnailItem } from '@/components/ThumbnailGrid'
import { DetailSheet } from '@/components/DetailSheet'
import { extractColors, applyColorOverrides, type ColorInfo } from '@/lib/colors'
import { useTheme } from '@/hooks/useTheme'
import { useSvgoQueue } from '@/hooks/useSvgoQueue'
import { getDefaultPluginStates, PLUGINS } from '@/lib/svgo-config'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SvgItem {
  id: string
  filename: string
  original: string
  optimized: string | null
  status: 'pending' | 'optimizing' | 'done' | 'error'
  error?: string
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `svg-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function App() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [svgs, setSvgs] = useState<SvgItem[]>([])
  const [pluginStates, setPluginStates] = useState<Record<string, boolean>>(getDefaultPluginStates)
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({})
  const [detailId, setDetailId] = useState<string | null>(null)

  const svgsRef = useRef(svgs)
  svgsRef.current = svgs

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { optimizeMany, cancel } = useSvgoQueue({
    onStart: useCallback((id: string) => {
      setSvgs(prev => prev.map(s => s.id === id ? { ...s, status: 'optimizing' } : s))
    }, []),
    onResult: useCallback((id: string, optimized: string) => {
      setSvgs(prev => prev.map(s => s.id === id ? { ...s, status: 'done', optimized, error: undefined } : s))
    }, []),
    onError: useCallback((id: string, error: string) => {
      setSvgs(prev => prev.map(s => s.id === id ? { ...s, status: 'error', error } : s))
    }, []),
    onDone: useCallback(() => {}, []),
  })

  const runOptimize = useCallback((items: SvgItem[], states: Record<string, boolean>) => {
    cancel()
    if (items.length === 0) return
    setSvgs(prev => prev.map(s => ({ ...s, status: 'pending' as const })))
    optimizeMany(
      items.map(s => ({ id: s.id, svg: s.original })),
      states,
    )
  }, [cancel, optimizeMany])

  const triggerOptimize = useCallback((items: SvgItem[], states: Record<string, boolean>) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runOptimize(items, states), 150)
  }, [runOptimize])

  const handleSvgsInput = useCallback((inputs: SvgInput[]) => {
    const newItems: SvgItem[] = inputs.map(input => ({
      id: makeId(),
      filename: input.filename,
      original: input.svg,
      optimized: null,
      status: 'pending',
    }))
    setSvgs(prev => {
      const merged = [...prev, ...newItems]
      triggerOptimize(merged, pluginStates)
      return merged
    })
  }, [pluginStates, triggerOptimize])

  const handlePasteInput = useCallback((svg: string) => {
    const item: SvgItem = {
      id: makeId(),
      filename: 'Pasted SVG',
      original: svg,
      optimized: null,
      status: 'pending',
    }
    setSvgs([item])
    triggerOptimize([item], pluginStates)
  }, [pluginStates, triggerOptimize])

  const handlePluginToggle = useCallback((pluginId: string, enabled: boolean) => {
    setPluginStates(prev => {
      const next = { ...prev, [pluginId]: enabled }
      triggerOptimize(svgsRef.current, next)
      return next
    })
  }, [triggerOptimize])

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaultPluginStates()
    setPluginStates(defaults)
    triggerOptimize(svgsRef.current, defaults)
  }, [triggerOptimize])

  const handleEnableAll = useCallback(() => {
    const all: Record<string, boolean> = {}
    for (const p of PLUGINS) all[p.id] = true
    setPluginStates(all)
    triggerOptimize(svgsRef.current, all)
  }, [triggerOptimize])

  const handleDisableAll = useCallback(() => {
    const none: Record<string, boolean> = {}
    for (const p of PLUGINS) none[p.id] = false
    setPluginStates(none)
    triggerOptimize(svgsRef.current, none)
  }, [triggerOptimize])

  const handleReset = useCallback(() => {
    cancel()
    setSvgs([])
    setColorOverrides({})
    setDetailId(null)
  }, [cancel])

  const handleColorChange = useCallback((originalNormalized: string, newColor: string) => {
    setColorOverrides(prev => ({ ...prev, [originalNormalized]: newColor }))
  }, [])

  const handleColorReset = useCallback(() => {
    setColorOverrides({})
  }, [])

  // Aggregate colors across all optimized SVGs (dedupe by normalized hex).
  const extractedColors = useMemo<ColorInfo[]>(() => {
    const map = new Map<string, ColorInfo>()
    for (const s of svgs) {
      if (!s.optimized) continue
      for (const c of extractColors(s.optimized)) {
        const existing = map.get(c.normalized)
        if (existing) {
          existing.count += c.count
        } else {
          map.set(c.normalized, { ...c })
        }
      }
    }
    return Array.from(map.values())
  }, [svgs])

  // Per-item modified SVG (optimized + color overrides applied).
  const modifiedById = useMemo(() => {
    const out = new Map<string, string | null>()
    const hasOverrides = Object.keys(colorOverrides).length > 0
    for (const s of svgs) {
      if (!s.optimized) {
        out.set(s.id, null)
        continue
      }
      out.set(s.id, hasOverrides ? applyColorOverrides(s.optimized, colorOverrides) : s.optimized)
    }
    return out
  }, [svgs, colorOverrides])

  const totals = useMemo(() => {
    let original = 0
    let optimized = 0
    for (const s of svgs) {
      original += new Blob([s.original]).size
      const m = modifiedById.get(s.id)
      optimized += m ? new Blob([m]).size : 0
    }
    return { original, optimized }
  }, [svgs, modifiedById])

  const pendingCount = svgs.filter(s => s.status === 'pending' || s.status === 'optimizing').length
  const errorItems = svgs.filter(s => s.status === 'error')

  const isBulk = svgs.length > 1
  const isEmpty = svgs.length === 0

  const thumbnailItems: ThumbnailItem[] = svgs.map(s => ({
    id: s.id,
    filename: s.filename,
    originalSize: new Blob([s.original]).size,
    optimizedSize: (() => {
      const m = modifiedById.get(s.id)
      return m ? new Blob([m]).size : 0
    })(),
    displaySvg: modifiedById.get(s.id) ?? null,
    status: s.status,
    error: s.error,
  }))

  const detailItem = detailId ? svgs.find(s => s.id === detailId) : null
  const detailModified = detailItem ? modifiedById.get(detailItem.id) ?? null : null
  const detailOriginalSize = detailItem ? new Blob([detailItem.original]).size : 0
  const detailOptimizedSize = detailModified ? new Blob([detailModified]).size : 0

  // Single-file mode helpers
  const single = !isBulk && svgs.length === 1 ? svgs[0] : null
  const singleModified = single ? modifiedById.get(single.id) ?? null : null

  const bulkExportItems = useMemo(
    () => svgs
      .filter(s => modifiedById.get(s.id))
      .map(s => ({ svg: modifiedById.get(s.id) as string, filename: s.filename })),
    [svgs, modifiedById],
  )

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />

        {isEmpty ? (
          <main className="flex-1 flex items-center justify-center">
            <DropZone onSvgsInput={handleSvgsInput} onPasteInput={handlePasteInput} />
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
                <div className="flex items-center gap-3 min-w-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium truncate">
                    {isBulk
                      ? `${svgs.length} files`
                      : single?.filename || 'Pasted SVG'}
                  </span>
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {isBulk
                        ? `Optimizing ${svgs.length - pendingCount + 1}/${svgs.length}…`
                        : 'Optimizing…'}
                    </span>
                  )}
                </div>
                {isBulk ? (
                  <ExportPanel bulkItems={bulkExportItems} />
                ) : (
                  <ExportPanel svg={singleModified} filename={single?.filename} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4 min-h-0">
                {svgs.length > 0 && (
                  <SizeComparison
                    originalSize={totals.original}
                    optimizedSize={totals.optimized}
                    label={isBulk ? `Total · ${svgs.length} files` : undefined}
                  />
                )}

                {errorItems.length > 0 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorItems.length === 1
                      ? `Error: ${errorItems[0].error}`
                      : `${errorItems.length} files failed to optimize.`}
                  </div>
                )}

                {extractedColors.length > 0 && (
                  <ColorPalette
                    colors={extractedColors}
                    overrides={colorOverrides}
                    onColorChange={handleColorChange}
                    onReset={handleColorReset}
                  />
                )}

                {isBulk ? (
                  <div className="flex-1 min-h-0 overflow-auto">
                    <ThumbnailGrid
                      items={thumbnailItems}
                      selectedId={detailId}
                      onSelect={setDetailId}
                    />
                  </div>
                ) : (
                  <SplitView
                    top={<CodeView code={singleModified} />}
                    bottom={<Preview svg={singleModified} className="h-full" />}
                  />
                )}
              </div>
            </div>
          </main>
        )}

        {detailItem && (
          <DetailSheet
            open={!!detailId}
            onOpenChange={(open) => { if (!open) setDetailId(null) }}
            filename={detailItem.filename}
            displaySvg={detailModified}
            originalSize={detailOriginalSize}
            optimizedSize={detailOptimizedSize}
          />
        )}
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
