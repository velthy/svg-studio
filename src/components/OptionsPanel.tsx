import { useRef, useState, useEffect } from 'react'
import { PLUGINS, PLUGIN_CATEGORIES } from '@/lib/svgo-config'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react'

interface OptionsPanelProps {
  pluginStates: Record<string, boolean>
  onPluginToggle: (pluginId: string, enabled: boolean) => void
  onResetDefaults: () => void
  onEnableAll: () => void
  onDisableAll: () => void
}

export function OptionsPanel({
  pluginStates,
  onPluginToggle,
  onResetDefaults,
  onEnableAll,
  onDisableAll,
}: OptionsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => {
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 10)
    }

    checkScroll()
    el.addEventListener('scroll', checkScroll)
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [])

  const pluginsByCategory = PLUGIN_CATEGORIES.map(category => ({
    category,
    plugins: PLUGINS.filter(p => p.category === category),
  }))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b min-h-[61px]">
        <h2 className="text-sm font-semibold">Optimizations</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEnableAll}
            title="Enable all"
          >
            <ToggleRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDisableAll}
            title="Disable all"
          >
            <ToggleLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onResetDefaults}
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto scrollbar-thin"
        >
          <div className="p-4 space-y-6">
            {pluginsByCategory.map(({ category, plugins }) => (
              <div key={category}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2.5">
                  {plugins.map(plugin => (
                    <div
                      key={plugin.id}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <Label
                        htmlFor={plugin.id}
                        className="text-sm font-normal cursor-pointer leading-tight flex-1 min-w-0"
                        title={plugin.description}
                      >
                        {plugin.label}
                      </Label>
                      <Switch
                        id={plugin.id}
                        checked={pluginStates[plugin.id] ?? plugin.enabledByDefault}
                        onCheckedChange={(checked) => onPluginToggle(plugin.id, checked)}
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator fade */}
        {canScrollDown && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
    </div>
  )
}
