export interface ColorInfo {
  /** The color value as it appears in the SVG (after SVGO normalization) */
  original: string
  /** Normalized 7-char hex (#rrggbb) for comparison */
  normalized: string
  /** Number of occurrences in the SVG */
  count: number
}

const CSS_NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
  grey: '#808080', silver: '#c0c0c0', maroon: '#800000', olive: '#808000',
  lime: '#00ff00', teal: '#008080', navy: '#000080', aqua: '#00ffff',
  fuchsia: '#ff00ff', transparent: 'transparent', none: 'none',
  currentcolor: 'currentColor', inherit: 'inherit',
}

/** Normalize any CSS color to a 7-char lowercase hex (#rrggbb) */
export function normalizeColor(color: string): string {
  const c = color.trim().toLowerCase()

  // Skip non-color values
  if (c === 'none' || c === 'transparent' || c === 'inherit' || c === 'currentcolor') {
    return c
  }

  // Named color
  if (CSS_NAMED_COLORS[c]) {
    return CSS_NAMED_COLORS[c]
  }

  // 4-char hex -> 7-char hex
  if (/^#[0-9a-f]{3}$/i.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }

  // Already 7-char hex
  if (/^#[0-9a-f]{6}$/i.test(c)) {
    return c
  }

  // rgb(r, g, b)
  const rgbMatch = c.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  return c
}

/** Check if a string is an actual color value (not none/inherit/etc) */
function isActualColor(color: string): boolean {
  const n = normalizeColor(color)
  return n !== 'none' && n !== 'transparent' && n !== 'inherit' && n !== 'currentColor'
}

/**
 * Extract all unique colors from an SVG string.
 * Works on SVGO-optimized SVG where colors are already normalized.
 */
export function extractColors(svg: string): ColorInfo[] {
  const colorCounts = new Map<string, { original: string; count: number }>()

  // Match colors in attributes: fill="...", stroke="...", stop-color="...", etc.
  const attrRegex = /(?:fill|stroke|stop-color|flood-color|lighting-color)="([^"]+)"/gi
  let match
  while ((match = attrRegex.exec(svg)) !== null) {
    const color = match[1]
    if (isActualColor(color)) {
      const norm = normalizeColor(color)
      const existing = colorCounts.get(norm)
      if (existing) {
        existing.count++
      } else {
        colorCounts.set(norm, { original: color, count: 1 })
      }
    }
  }

  // Match colors in inline styles: style="...fill:red..." style="...stroke:#000..."
  const styleRegex = /style="([^"]+)"/gi
  while ((match = styleRegex.exec(svg)) !== null) {
    const styleStr = match[1]
    const propRegex = /(?:fill|stroke|stop-color|flood-color|lighting-color)\s*:\s*([^;}"]+)/gi
    let propMatch
    while ((propMatch = propRegex.exec(styleStr)) !== null) {
      const color = propMatch[1].trim()
      if (isActualColor(color)) {
        const norm = normalizeColor(color)
        const existing = colorCounts.get(norm)
        if (existing) {
          existing.count++
        } else {
          colorCounts.set(norm, { original: color, count: 1 })
        }
      }
    }
  }

  return Array.from(colorCounts.entries()).map(([normalized, { original, count }]) => ({
    original,
    normalized,
    count,
  }))
}

/**
 * Apply color overrides to an SVG string.
 * Replaces all occurrences of each original color with the new color.
 */
export function applyColorOverrides(
  svg: string,
  overrides: Record<string, string>,
): string {
  let result = svg

  for (const [originalNormalized, newColor] of Object.entries(overrides)) {
    if (originalNormalized === newColor) continue

    // Find the actual color strings used in this SVG for this normalized color
    const colors = extractColors(result)
    const matching = colors.find(c => c.normalized === originalNormalized)
    if (!matching) continue

    // Replace in attributes: fill="oldColor" -> fill="newColor"
    const attrRegex = new RegExp(
      `((?:fill|stroke|stop-color|flood-color|lighting-color)=")${escapeRegex(matching.original)}"`,
      'gi'
    )
    result = result.replace(attrRegex, `$1${newColor}"`)

    // Replace in inline styles: fill:oldColor -> fill:newColor
    const styleRegex = new RegExp(
      `((?:fill|stroke|stop-color|flood-color|lighting-color)\\s*:\\s*)${escapeRegex(matching.original)}`,
      'gi'
    )
    result = result.replace(styleRegex, `$1${newColor}`)
  }

  return result
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
