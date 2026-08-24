"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "motion/react"
import { GripVertical, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SortableTrackProps {
  id: number
  /** Display position, 1-based at render time. */
  index: number
  onRemove: () => void
  /** Shared easing so rows stay in step with the rest of the form. */
  ease: readonly [number, number, number, number]
}

export function SortableTrack({ id, index, onRemove, ease }: SortableTrackProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <motion.li
      ref={setNodeRef}
      // dnd-kit owns transform; the height/opacity animation below deliberately
      // avoids transform values so the two never fight over the same property.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.26, ease }}
      className={cn("overflow-hidden", isDragging && "relative z-10")}
    >
      {/* Gap lives inside the animated box so it collapses with the row */}
      <div className="pb-2">
        <div
          className={cn(
            "flex justify-between items-center p-3 bg-amber-50 rounded-lg border-2 border-[#d3c59e]",
            isDragging && "shadow-lg",
          )}
        >
          <span className="flex items-center gap-2 font-medium text-gray-700">
            {/* Drag lives on the handle alone, so the remove button and text
                selection are never hijacked by a drag gesture. */}
            <button
              type="button"
              aria-label={`Reorder track ${index + 1}`}
              {...attributes}
              {...listeners}
              className="touch-none cursor-grab text-stone-400 transition-colors hover:text-stone-600 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            Track {index + 1}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-400 hover:bg-red-100 bg-red-50 active:scale-90 cursor-pointer"
          >
            <Trash />
          </Button>
        </div>
      </div>
    </motion.li>
  )
}
