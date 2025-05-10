"use client"

import type React from "react"

import { useState } from "react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import type { ComponentProps } from "react"

interface ConfettiButtonProps extends ComponentProps<typeof Button> {
  confettiColors?: string[]
  particleCount?: number
  spread?: number
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
}

export function ConfettiButton({
  children,
  confettiColors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
  particleCount = 100,
  spread = 100,
  onClick,
  disabled,
  className,
  ...props
}: ConfettiButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get the button's position
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    // Trigger the confetti
    setIsLoading(true)

    confetti({
      particleCount,
      spread,
      colors: confettiColors,
      origin: { x, y },
      disableForReducedMotion: true,
    })

    // Reset loading state after animation
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Call the original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Button {...props} onClick={handleClick} disabled={isLoading || disabled} className={className}>
      {children}
    </Button>
  )
}
