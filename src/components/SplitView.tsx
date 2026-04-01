import { useCallback, useRef, useState, type ReactNode } from 'react'
import { GripHorizontal } from 'lucide-react'

interface SplitViewProps {
  top: ReactNode
  bottom: ReactNode
  defaultTopHeight?: number
  minTopHeight?: number
  minBottomHeight?: number
}

export function SplitView({
  top,
  bottom,
  defaultTopHeight = 56,
  minTopHeight = 40,
  minBottomHeight = 120,
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [topHeight, setTopHeight] = useState(defaultTopHeight)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startY = e.clientY
    const startHeight = topHeight

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const maxTopHeight = containerRect.height - minBottomHeight - 8 // 8px for handle
      const delta = e.clientY - startY
      const newHeight = Math.min(maxTopHeight, Math.max(minTopHeight, startHeight + delta))
      setTopHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [topHeight, minTopHeight, minBottomHeight])

  return (
    <div ref={containerRef} className="flex flex-col h-full overflow-hidden">
      {/* Top panel (Code) */}
      <div
        className="shrink-0 overflow-hidden"
        style={{ height: topHeight }}
      >
        {top}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          shrink-0 flex items-center justify-center h-2 cursor-row-resize
          group transition-colors
          ${isDragging ? 'bg-primary/20' : 'hover:bg-muted'}
        `}
      >
        <GripHorizontal className={`h-3.5 w-3.5 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`} />
      </div>

      {/* Bottom panel (Preview) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {bottom}
      </div>
    </div>
  )
}
