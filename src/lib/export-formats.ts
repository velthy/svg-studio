export type ExportFormat =
  | 'svg'
  | 'dataUrl'
  | 'backgroundImage'
  | 'maskImage'
  | 'listStyleImage'

export interface ExportOption {
  id: ExportFormat
  label: string
  description: string
}

export const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'svg', label: 'SVG Code', description: 'Raw SVG markup' },
  { id: 'dataUrl', label: 'Data URL', description: 'data:image/svg+xml encoded' },
  { id: 'backgroundImage', label: 'CSS background-image', description: 'background-image: url(...)' },
  { id: 'maskImage', label: 'CSS mask-image', description: 'mask-image: url(...)' },
  { id: 'listStyleImage', label: 'CSS list-style-image', description: 'list-style-image: url(...)' },
]

function svgToDataUrl(svg: string): string {
  const encoded = svg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\s+/g, ' ')
    .trim()
  return `data:image/svg+xml,${encoded}`
}

export function formatSvgForExport(svg: string, format: ExportFormat): string {
  switch (format) {
    case 'svg':
      return svg
    case 'dataUrl':
      return svgToDataUrl(svg)
    case 'backgroundImage':
      return `background-image: url("${svgToDataUrl(svg)}");`
    case 'maskImage':
      return `mask-image: url("${svgToDataUrl(svg)}");`
    case 'listStyleImage':
      return `list-style-image: url("${svgToDataUrl(svg)}");`
  }
}
