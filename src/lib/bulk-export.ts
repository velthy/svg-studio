export interface ZipItem {
  filename: string
  content: string
}

function dedupeFilenames(items: ZipItem[]): ZipItem[] {
  const counts = new Map<string, number>()
  return items.map(item => {
    const seen = counts.get(item.filename) ?? 0
    counts.set(item.filename, seen + 1)
    if (seen === 0) return item
    const dot = item.filename.lastIndexOf('.')
    const base = dot > 0 ? item.filename.slice(0, dot) : item.filename
    const ext = dot > 0 ? item.filename.slice(dot) : ''
    return { ...item, filename: `${base} (${seen})${ext}` }
  })
}

export async function downloadZip(items: ZipItem[], zipName = 'svgs-optimized.zip'): Promise<void> {
  if (items.length === 0) return
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const item of dedupeFilenames(items)) {
    zip.file(item.filename, item.content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  a.click()
  URL.revokeObjectURL(url)
}

export function optimizedFilename(original: string): string {
  const dot = original.toLowerCase().lastIndexOf('.svg')
  if (dot > 0) return `${original.slice(0, dot)}-optimized.svg`
  return `${original}-optimized.svg`
}
