import { toast } from 'sonner'

export interface SvgInput {
  svg: string
  filename: string
}

export const MAX_FILES = 50
const SOFT_SIZE_WARN_BYTES = 2 * 1024 * 1024

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * Validate and parse a list of dropped/picked files into SvgInput[].
 * Honors MAX_FILES against the current count, skips non-SVG files,
 * and warns on files larger than 2 MB. Emits toasts for any skips.
 */
export async function processSvgFiles(
  fileList: FileList | File[],
  currentCount: number,
): Promise<SvgInput[]> {
  const all = Array.from(fileList)
  if (all.length === 0) return []

  const remaining = Math.max(0, MAX_FILES - currentCount)
  let files = all
  let skippedOver = 0
  if (files.length > remaining) {
    skippedOver = files.length - remaining
    files = files.slice(0, remaining)
  }

  const oversized: string[] = []
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const text = await readFileAsText(file)
        if (!text || !text.includes('<svg')) return null
        if (file.size > SOFT_SIZE_WARN_BYTES) oversized.push(file.name)
        return { svg: text, filename: file.name } satisfies SvgInput
      } catch {
        return null
      }
    }),
  )

  const valid = results.filter((r): r is SvgInput => r !== null)
  const skippedInvalid = files.length - valid.length

  if (skippedOver > 0) {
    toast.warning(
      currentCount > 0
        ? `Limit of ${MAX_FILES} files reached — skipped ${skippedOver} file${skippedOver > 1 ? 's' : ''}.`
        : `Maximum ${MAX_FILES} files — skipped ${skippedOver} extra file${skippedOver > 1 ? 's' : ''}.`,
    )
  }
  if (skippedInvalid > 0) {
    toast.warning(`Skipped ${skippedInvalid} file${skippedInvalid > 1 ? 's' : ''} (not valid SVG).`)
  }
  if (oversized.length > 0) {
    toast.warning(`${oversized.length} file${oversized.length > 1 ? 's are' : ' is'} larger than 2 MB — optimization may be slow.`)
  }

  return valid
}
