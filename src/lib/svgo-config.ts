export interface PluginOption {
  id: string
  label: string
  description: string
  enabledByDefault: boolean
  category: string
}

export const PLUGIN_CATEGORIES = [
  'Cleanup',
  'Removal',
  'Conversion',
  'Optimization',
] as const

export const PLUGINS: PluginOption[] = [
  // Cleanup
  { id: 'removeDoctype', label: 'Remove doctype', description: 'Remove DOCTYPE declaration', enabledByDefault: true, category: 'Cleanup' },
  { id: 'removeXMLProcInst', label: 'Remove XML instructions', description: 'Remove XML processing instructions', enabledByDefault: true, category: 'Cleanup' },
  { id: 'removeComments', label: 'Remove comments', description: 'Remove XML comments', enabledByDefault: true, category: 'Cleanup' },
  { id: 'removeMetadata', label: 'Remove <metadata>', description: 'Remove metadata elements', enabledByDefault: true, category: 'Cleanup' },
{ id: 'removeEditorsNSData', label: 'Remove editor data', description: 'Remove editor-specific namespace data', enabledByDefault: true, category: 'Cleanup' },
  { id: 'cleanupAttrs', label: 'Clean up attribute whitespace', description: 'Clean up whitespace in attribute values', enabledByDefault: true, category: 'Cleanup' },
  { id: 'cleanupIds', label: 'Clean up IDs', description: 'Minify and remove unused IDs', enabledByDefault: true, category: 'Cleanup' },
  { id: 'cleanupNumericValues', label: 'Round/rewrite numbers', description: 'Round numeric values and remove default units', enabledByDefault: true, category: 'Cleanup' },
  { id: 'cleanupListOfValues', label: 'Round/rewrite number lists', description: 'Round numbers in list-form attributes', enabledByDefault: false, category: 'Cleanup' },
  { id: 'cleanupEnableBackground', label: 'Remove/tidy enable-background', description: 'Remove or tidy enable-background attribute', enabledByDefault: true, category: 'Cleanup' },

  // Removal
  { id: 'removeRasterImages', label: 'Remove raster images', description: 'Remove embedded raster images', enabledByDefault: false, category: 'Removal' },
  { id: 'removeUselessDefs', label: 'Remove unused defs', description: 'Remove unused defs elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeUnknownsAndDefaults', label: 'Remove unknowns & defaults', description: 'Remove unknown elements and default attribute values', enabledByDefault: true, category: 'Removal' },
  { id: 'removeNonInheritableGroupAttrs', label: 'Remove unneeded group attrs', description: 'Remove non-inheritable group attributes', enabledByDefault: true, category: 'Removal' },
  { id: 'removeUselessStrokeAndFill', label: 'Remove useless stroke & fill', description: 'Remove useless stroke and fill attributes', enabledByDefault: true, category: 'Removal' },
  { id: 'removeViewBox', label: 'Remove viewBox', description: 'Remove viewBox attribute when possible', enabledByDefault: false, category: 'Removal' },
  { id: 'removeHiddenElems', label: 'Remove hidden elements', description: 'Remove invisible and hidden elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeEmptyText', label: 'Remove empty text', description: 'Remove empty text elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeEmptyAttrs', label: 'Remove empty attrs', description: 'Remove empty attribute values', enabledByDefault: true, category: 'Removal' },
  { id: 'removeEmptyContainers', label: 'Remove empty containers', description: 'Remove empty container elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeUnusedNS', label: 'Remove unused namespaces', description: 'Remove unused namespace declarations', enabledByDefault: true, category: 'Removal' },
  { id: 'removeTitle', label: 'Remove <title>', description: 'Remove title elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeDesc', label: 'Remove <desc>', description: 'Remove desc elements', enabledByDefault: true, category: 'Removal' },
  { id: 'removeStyleElement', label: 'Remove style elements', description: 'Remove <style> elements', enabledByDefault: false, category: 'Removal' },
  { id: 'removeScripts', label: 'Remove script elements', description: 'Remove <script> elements and event handlers', enabledByDefault: false, category: 'Removal' },
  { id: 'removeOffCanvasPaths', label: 'Remove out-of-bounds paths', description: 'Remove paths outside the viewBox', enabledByDefault: false, category: 'Removal' },

  // Conversion
  { id: 'convertStyleToAttrs', label: 'Style to attributes', description: 'Convert style properties to presentation attributes', enabledByDefault: false, category: 'Conversion' },
  { id: 'convertColors', label: 'Minify colours', description: 'Minify color values', enabledByDefault: true, category: 'Conversion' },
  { id: 'convertShapeToPath', label: 'Shapes to (smaller) paths', description: 'Convert basic shapes to paths when smaller', enabledByDefault: true, category: 'Conversion' },
  { id: 'convertEllipseToCircle', label: 'Convert non-eccentric <ellipse> to <circle>', description: 'Convert ellipses with equal radii to circles', enabledByDefault: true, category: 'Conversion' },
  { id: 'convertPathData', label: 'Round/rewrite paths', description: 'Optimize and round path data', enabledByDefault: true, category: 'Conversion' },
  { id: 'convertTransform', label: 'Round/rewrite transforms', description: 'Optimize and round transform values', enabledByDefault: true, category: 'Conversion' },

  // Optimization
  { id: 'mergeStyles', label: 'Merge styles', description: 'Merge multiple style elements into one', enabledByDefault: true, category: 'Optimization' },
  { id: 'inlineStyles', label: 'Inline styles', description: 'Move styles from <style> to element attributes', enabledByDefault: true, category: 'Optimization' },
  { id: 'minifyStyles', label: 'Minify styles', description: 'Minify CSS in <style> elements', enabledByDefault: true, category: 'Optimization' },
  { id: 'moveElemsAttrsToGroup', label: 'Move attrs to parent group', description: 'Move shared attributes to parent group', enabledByDefault: true, category: 'Optimization' },
  { id: 'moveGroupAttrsToElems', label: 'Move group attrs to elements', description: 'Move group attributes to child elements', enabledByDefault: true, category: 'Optimization' },
  { id: 'collapseGroups', label: 'Collapse useless groups', description: 'Collapse groups with no useful attributes', enabledByDefault: true, category: 'Optimization' },
  { id: 'mergePaths', label: 'Merge paths', description: 'Merge adjacent path elements', enabledByDefault: true, category: 'Optimization' },
  { id: 'reusePaths', label: 'Replace duplicate elements with links', description: 'Replace duplicated elements with <use> links', enabledByDefault: false, category: 'Optimization' },
  { id: 'sortAttrs', label: 'Sort attrs', description: 'Sort element attributes for consistency', enabledByDefault: true, category: 'Optimization' },
  { id: 'sortDefsChildren', label: 'Sort children of <defs>', description: 'Sort children of <defs> for consistency', enabledByDefault: true, category: 'Optimization' },
  { id: 'removeDimensions', label: 'Prefer viewBox to width/height', description: 'Remove width/height and prefer viewBox', enabledByDefault: true, category: 'Optimization' },
]

export function getDefaultPluginStates(): Record<string, boolean> {
  const states: Record<string, boolean> = {}
  for (const plugin of PLUGINS) {
    states[plugin.id] = plugin.enabledByDefault
  }
  return states
}

export function buildSvgoConfig(pluginStates: Record<string, boolean>) {
  const plugins: Array<{ name: string; active: boolean }> = []
  for (const plugin of PLUGINS) {
    plugins.push({
      name: plugin.id,
      active: pluginStates[plugin.id] ?? plugin.enabledByDefault,
    })
  }
  return { plugins }
}
