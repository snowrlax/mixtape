"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface CollageTransform {
  /** Horizontal offset; a percentage string is relative to the piece's own width. */
  x?: string | number
  rotate?: number
}

export interface CollageAssetProps {
  src: string
  /** Whether the piece is popped in. */
  open: boolean
  /** Transform while tucked away. */
  from: CollageTransform
  /** Transform once popped in. */
  to: CollageTransform
  /** Stagger in seconds, so pieces don't all fire on the same frame. */
  delay?: number
  /** Positioning and size utilities, e.g. "fixed bottom-0 left-0 h-80". */
  className?: string
}

/**
 * A cut-out that waits off-screen and swings in, pivoting on the bottom of the
 * image so it rises from the edge rather than sliding flatly across it.
 */
export function CollageAsset({ src, open, from, to, delay = 0, className }: CollageAssetProps) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      initial={false}
      style={{ transformOrigin: "50% 100%" }}
      animate={{
        ...(open ? to : from),
        filter: open
          ? "drop-shadow(0px 18px 26px rgba(0,0,0,0.28))"
          : "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))",
      }}
      transition={{
        // Loose and bouncy on the way in, tight and quick on the way out.
        default: open
          ? { type: "spring", stiffness: 110, damping: 11, mass: 1, delay }
          : { type: "spring", stiffness: 150, damping: 22, mass: 0.8 },
        filter: { duration: 0.35 },
      }}
      className={cn("pointer-events-none z-0 w-auto max-w-none select-none", className)}
    />
  )
}
