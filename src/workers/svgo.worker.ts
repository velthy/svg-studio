import { optimize, type PluginConfig } from 'svgo'

interface OptimizeMessage {
  id: number
  svg: string
  config: {
    plugins: Array<{ name: string; active: boolean }>
  }
}

self.onmessage = (e: MessageEvent<OptimizeMessage>) => {
  const { id, svg, config } = e.data

  try {
    // Build overrides for preset-default plugins
    const overrides: Record<string, boolean | object> = {}
    for (const p of config.plugins) {
      if (PRESET_DEFAULT_PLUGINS.has(p.name)) {
        if (p.name === 'removeDesc' && p.active) {
          overrides[p.name] = { removeAny: true }
        } else {
          overrides[p.name] = p.active
        }
      }
    }

    // Collect non-preset plugins that are active
    const extraPlugins = config.plugins
      .filter(p => p.active && !PRESET_DEFAULT_PLUGINS.has(p.name))
      .map(p => p.name)

    const result = optimize(svg, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: { overrides },
        },
        ...extraPlugins as PluginConfig[],
      ],
    })

    self.postMessage({ id, success: true, data: result.data })
  } catch (err) {
    self.postMessage({
      id,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

const PRESET_DEFAULT_PLUGINS = new Set([
  'removeDoctype', 'removeXMLProcInst', 'removeComments', 'removeMetadata',
  'removeEditorsNSData', 'cleanupAttrs', 'mergeStyles', 'inlineStyles',
  'minifyStyles', 'cleanupIds', 'removeUselessDefs', 'cleanupNumericValues',
  'convertColors', 'removeUnknownsAndDefaults', 'removeNonInheritableGroupAttrs',
  'removeUselessStrokeAndFill', 'cleanupEnableBackground', 'removeHiddenElems',
  'removeEmptyText', 'convertShapeToPath', 'convertEllipseToCircle',
  'moveElemsAttrsToGroup', 'moveGroupAttrsToElems', 'collapseGroups',
  'convertPathData', 'convertTransform', 'removeEmptyAttrs', 'removeEmptyContainers',
  'removeUnusedNS', 'mergePaths', 'sortAttrs', 'sortDefsChildren', 'removeDesc',
])
