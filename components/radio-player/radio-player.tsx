"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  coverUrl: string
  audioUrl: string
}

export interface RadioPlayerProps {
  songs: Song[]
  variant?: "modern" | "minimal" | "retro" | "dark"
  className?: string
}

export function RadioPlayer({ songs, variant = "modern", className }: RadioPlayerProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [frequency, setFrequency] = useState(98.5)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSong = songs[currentSongIndex]

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSongIndex])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    handleNext()
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    setCurrentSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1))
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev === songs.length - 1 ? 0 : prev + 1))
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (value[0] > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleFrequencyChange = (value: number[]) => {
    setFrequency(value[0])
  }

  // Different style variants
  const variantStyles = {
    modern: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white",
    minimal: "bg-white dark:bg-gray-900 border dark:border-gray-800",
    retro: "bg-[#f5e9c9] border-2 border-[#d3c59e] text-gray-800",
    dark: "bg-gray-900 text-gray-100 border border-gray-800",
  }

  return (
    <Card className={cn("w-full max-w-md overflow-hidden transition-all", variantStyles[variant], className)}>
      <audio ref={audioRef} src={currentSong.audioUrl} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />

      {variant === "retro" && (
        <div className="px-4 pt-4">
          <div className="relative h-6 w-full bg-[#e6d7b0] rounded-full mb-2 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs">
              <span>88</span>
              <span>92</span>
              <span>96</span>
              <span>100</span>
              <span>104</span>
              <span>108</span>
              <span className="text-right">MHz</span>
            </div>
            <div className="absolute h-full w-1 bg-red-500" style={{ left: `${((frequency - 88) / 20) * 100}%` }} />
          </div>
          <Slider
            value={[frequency]}
            min={88}
            max={108}
            step={0.1}
            onValueChange={handleFrequencyChange}
            className="mb-4"
          />
        </div>
      )}

      <CardContent className={cn("p-4", variant === "retro" ? "pt-0" : "")}>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn("relative shrink-0 rounded overflow-hidden", variant === "retro" ? "w-20 h-20" : "w-16 h-16")}
          >
            <img
              src={currentSong.coverUrl || "/placeholder.svg?height=80&width=80"}
              alt={currentSong.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className={cn("font-medium truncate", variant === "retro" ? "text-lg" : "text-base")}>
              {currentSong.title}
            </div>
            <div className="text-sm opacity-80 truncate">{currentSong.artist}</div>

            {variant === "retro" && (
              <div className="mt-2 px-2 py-1 bg-[#e6d7b0] inline-block text-xs uppercase tracking-wider text-stone-600">
                NO TAPE
                <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
            )}
          </div>

          {variant !== "retro" && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="h-8 w-8">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={currentSong.duration}
            step={0.1}
            onValueChange={handleSeek}
            className={cn(
              variant === "retro" ? "h-1.5" : "h-1",
              variant === "modern" ? "[&>span:first-child]:bg-white/30 [&>span:first-child_span]:bg-white" : "",
            )}
          />

          <div className="flex items-center justify-between text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>
        </div>

        <div className={cn("flex items-center justify-center gap-2 mt-4", variant === "retro" ? "mt-6" : "mt-4")}>
          <Button
            variant={variant === "retro" ? "outline" : "secondary"}
            size={variant === "retro" ? "icon" : "sm"}
            onClick={handlePrevious}
            className={cn(variant === "retro" ? "h-12 w-12 rounded-full bg-[#e6d7b0]" : "")}
          >
            <SkipBack className={variant === "retro" ? "h-5 w-5" : "h-4 w-4"} />
          </Button>

          <Button
            variant={variant === "retro" ? "outline" : "default"}
            size={variant === "retro" ? "icon" : "default"}
            onClick={handlePlay}
            className={cn(variant === "retro" ? "h-14 w-14 rounded-full bg-[#e6d7b0]" : "")}
          >
            {isPlaying ? (
              <Pause className={variant === "retro" ? "h-6 w-6" : "h-5 w-5"} />
            ) : (
              <Play className={variant === "retro" ? "h-6 w-6" : "h-5 w-5"} />
            )}
          </Button>

          <Button
            variant={variant === "retro" ? "outline" : "secondary"}
            size={variant === "retro" ? "icon" : "sm"}
            onClick={handleNext}
            className={cn(variant === "retro" ? "h-12 w-12 rounded-full bg-[#e6d7b0]" : "")}
          >
            <SkipForward className={variant === "retro" ? "h-5 w-5" : "h-4 w-4"} />
          </Button>
        </div>

        {variant === "retro" && (
          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="sm" onClick={handleMuteToggle} className="text-xs">
              VOL
              <span className="ml-1 inline-block w-2 h-2 rounded-full bg-gray-800"></span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

