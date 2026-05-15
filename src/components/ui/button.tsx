import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type Variant = "default" | "outline" | "ghost"
type Size = "default" | "sm" | "icon"

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn("btn", className)}
      {...props}
    />
  )
}

export { Button }
