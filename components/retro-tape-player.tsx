"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { playSoundEffect } from "@/public"
import { cmmnhlpr } from "@/lib/commonhelper"

// Add YouTube IFrame API type declaration
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height: string | number;
          width: string | number;
          playerVars?: any;
          events?: any;
        }
      ) => any;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
  getPlayerState: () => number;
}

export interface Song {
  id: string        // YouTube video ID
  title: string
  artist: string
  duration: number  // Will be fetched from YouTube if not provided
}

export interface RetroTapePlayerProps {
  songs: Song[]
  to: string
  className?: string
}

export function RetroTapePlayer({ songs, to, className }: RetroTapePlayerProps) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70) // YouTube volume is 0-100
  const [isMuted, setIsMuted] = useState(false)
  const [frequency, setFrequency] = useState(98.5)
  const [isTapeInserted, setIsTapeInserted] = useState(false)
  const [isEjecting, setIsEjecting] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  const playerRef = useRef<YTPlayer | null>(null)
  const isChangingSong = useRef(false)
  const playerElementId = 'youtube-player'
  const currentSong = songs[currentSongIndex]

  // Initialize YouTube player
  useEffect(() => {
    // Create a hidden div for the player if it doesn't exist
    if (!document.getElementById(playerElementId)) {
      const playerDiv = document.createElement('div')
      playerDiv.id = playerElementId
      playerDiv.style.height = '1px'
      playerDiv.style.width = '1px'
      playerDiv.style.visibility = 'hidden'
      document.body.appendChild(playerDiv)
    }

    // Define the onYouTubeIframeAPIReady function
    if (!(window as any).onYouTubeIframeAPIReady) {
      (window as any).onYouTubeIframeAPIReady = () => {
        if (typeof window.YT !== 'undefined' && window.YT.Player) {
          playerRef.current = new window.YT.Player(playerElementId, {
            height: '1',
            width: '1',
            playerVars: {
              'autoplay': 0,
              'controls': 0,
              'disablekb': 1,
              'fs': 0,
              'iv_load_policy': 3,
              'rel': 0,
              'modestbranding': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange,
              'onError': onPlayerError
            }
          }) as unknown as YTPlayer
        }
      }
    }

    // Load YouTube API if not already loaded
    if (typeof window.YT === 'undefined' || !window.YT.Player) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    } else {
      // If YT API is already loaded
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(playerElementId, {
          height: '1',
          width: '1',
          playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'rel': 0,
            'modestbranding': 1
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
          }
        }) as unknown as YTPlayer
      }
    }

    // Cleanup on component unmount
    return () => {

      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  // Handle player ready event
  const onPlayerReady = () => {
    setIsPlayerReady(true)
    if (currentSong && isTapeInserted) {
      playerRef.current?.loadVideoById(currentSong.id)
      playerRef.current?.pauseVideo()
      updateVolumeSettings()
    }
  }

  // Handle player state change
  const onPlayerStateChange = (event: { data: number }) => {
    // YouTube states: -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering
    if (event.data === 0) { // Video ended
      handleNext()
    } else if (event.data === 1) { // Playing
      setIsPlaying(true)
    } else if (event.data === 2 && !isChangingSong.current) { // Paused
      setIsPlaying(false)
    }
    isChangingSong.current = false
  }

  // Handle player errors
  const onPlayerError = (event: { data: number }) => {
    console.error('YouTube player error:', event.data)
    handleNext() // Move to next song on error
  }

  // Effect for play/pause state changes
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !isTapeInserted) return

    console.log('isPlaying in useEffect', isPlaying)

    if (isPlaying) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
  }, [isPlaying, isPlayerReady, isTapeInserted])

  // Effect for song changes
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || !isTapeInserted) return

    playerRef.current.loadVideoById(currentSong.id)
    if (isPlaying) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
    updateVolumeSettings()
  }, [currentSongIndex, isPlayerReady, isTapeInserted])

  // Effect for volume/mute changes
  useEffect(() => {
    updateVolumeSettings()
  }, [volume, isMuted, isPlayerReady])

  // Update volume and mute settings
  const updateVolumeSettings = () => {
    if (!isPlayerReady || !playerRef.current) return

    if (isMuted) {
      playerRef.current.mute()
    } else {
      playerRef.current.unMute()
      playerRef.current.setVolume(volume)
    }
  }

  const handlePlay = () => {
    playSoundEffect('/sound-effects/cassette-tape-button.mp3');
    console.log('usPlaying in handlePlay', !isPlaying)
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    playSoundEffect('/sound-effects/cassette-tape-button.mp3');
    isChangingSong.current = true;
    setCurrentSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1))
    console.log('usPlaying in handlePrevious true')
    setIsPlaying(true)
  }

  const handleNext = () => {
    playSoundEffect('/sound-effects/cassette-tape-button.mp3');
    isChangingSong.current = true;
    setCurrentSongIndex((prev) => (prev === songs.length - 1 ? 0 : prev + 1))
    console.log('usPlaying in handleNext true')
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

  const handleFrequencyChange = (value: number[]) => {
    setFrequency(value[0])
  }

  const handleEjectTape = () => {
    if (isTapeInserted) {
      playSoundEffect('/sound-effects/cassette-eject.mp3');

      setIsEjecting(true)
      if (isPlaying) {
        setIsPlaying(false)
        console.log('isPlaying in handleEjectTape false')
      }
      setTimeout(() => {
        setIsTapeInserted(false)
        setIsEjecting(false)
      }, 1000)
    } else {
      playSoundEffect('/sound-effects/tape-cassette-insert.mp3');

      setIsEjecting(true)
      setTimeout(() => {
        setIsTapeInserted(true)
        setIsEjecting(false)
      }, 1000)
    }
  }



  return (
    <Card
      className={cn(
        "w-full max-w-md overflow-hidden transition-all rounded-lg shadow-lg py-0",
        cmmnhlpr.themeStyles.body,
        className,
      )}
    >
      {/* Radio Frequency Display */}
      <div className="px-6 pt-6">
        <div
          className={cn(
            "relative h-8 w-full rounded-md mb-2 overflow-hidden flex items-center px-4",
            cmmnhlpr.themeStyles.display,
          )}
        >
          <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-stone-500">
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
          disabled
          value={[frequency]}
          min={88}
          max={108}
          step={0.1}
          onValueChange={handleFrequencyChange}
          className={cn(
            "mb-4",
            "[&>span:first-child]:h-1.5",
            "[&>span:first-child]:bg-gray-400/30",
            "[&>span:first-child_span]:bg-red-300",
            "[&_[role=slider]]:h-3",
            "[&_[role=slider]]:w-3",
            "[&_[role=slider]]:border-0",
            "[&_[role=slider]]:bg-red-400",
          )}
        />
      </div>

      <CardContent className="p-6 pt-2">
        {/* Cassette Tape Display */}
        <div
          className={cn(
            "relative w-full aspect-[3/2] rounded-lg overflow-hidden mb-4 p-4 border ",
            cmmnhlpr.themeStyles.window,
          )}
        >
          {/* Empty Tape Slot when ejected */}
          {!isTapeInserted && !isEjecting && (
            <div className={cn("absolute inset-0 p-3 flex items-center justify-center", cmmnhlpr.themeStyles.window)}>
              <div className="text-xs text-stone-500 uppercase tracking-wider">No Tape</div>
            </div>
          )}

          {/* Animated Tape */}
          <div className={cn("absolute inset-[10%] transition-transform duration-1000 h-44 w-80 flex-col rounded-xl border-8 bg-amber-100",
            cmmnhlpr.themeStyles.tape,
            isEjecting && isTapeInserted ? "-translate-y-[120%]" : "",
            isEjecting && !isTapeInserted ? "translate-y-0" : "",
            !isEjecting && !isTapeInserted ? "-translate-y-[120%]" : "",
            "transform-gpu", // Hardware acceleration
          )}>
            <div className="absolute top-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
            <div className="absolute top-2 right-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
            <div className="absolute bottom-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
            <div className="absolute right-2 bottom-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
            <div className="flex h-1/2 w-full items-center">
              <div className="z-20 mx-auto h-12 w-[90%] rounded-sm bg-amber-100 flex items-center justify-center" >
                <div className="text-center text-lg font-bold text-black font-mono -rotate-2">
                  <p>{to.toUpperCase()}'S MIX</p>
                </div>
              </div>
            </div>
            <div className="mx-auto flex h-12 w-[60%] justify-between items-center rounded-xl border-2 border-white bg-amber-200 p-2">
              <div className="h-8 w-8 rounded-full border-4 bg-stone-700 border-stone-400" />
              <div className="h-8 w-20 rounded-sm border-4 border-amber-800 bg-amber-950" />
              <div className="h-8 w-8 rounded-full border-4 bg-stone-700 border-stone-400" />
            </div>
          </div>





          {/* Status Indicators */}
          <div className="flex items-center justify-between mt-4 absolute bottom-2 right-2 w-[95%] mx-auto">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  !isPlayerReady ? "bg-yellow-500" : !isTapeInserted ? "bg-yellow-500" : isPlaying ? "bg-green-500" : "bg-green-500",
                )}
              ></div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEjectTape}
              className={cn(
                cmmnhlpr.themeStyles.buttons,
                "text-xs uppercase tracking-wider text-stone-600",
                (isEjecting || !isPlayerReady) && "opacity-50 cursor-not-allowed",
              )}
              disabled={isEjecting || !isPlayerReady}
            >
              {isTapeInserted ? "Eject" : "Insert"}
            </Button>
          </div>

        </div>

        {/* Song Info Display */}
        <div className={cn("flex items-center justify-between px-3 py-2 rounded-md mb-4", cmmnhlpr.themeStyles.display)}>
          <div className="text-xs font-light text-gray-800 truncate tracking-wider">
            {isTapeInserted ? `Track ${currentSongIndex + 1} / ${songs.length}` : "No Tape"}
          </div>
          <div className="text-xs font-mono text-gray-800">
            00:00 / 00:00
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className={cn(
                "h-8 w-8 rounded-full",
                cmmnhlpr.themeStyles.buttons,
                (!isTapeInserted || !isPlayerReady) && "opacity-50 cursor-not-allowed",
              )}
              disabled={!isTapeInserted || !isPlayerReady}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              className={cn(
                "h-8 w-8 rounded-full",
                cmmnhlpr.themeStyles.buttons,
                (!isTapeInserted || !isPlayerReady) && "opacity-50 cursor-not-allowed",
              )}
              disabled={!isTapeInserted || !isPlayerReady}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className={cn(
                "h-8 w-8 rounded-full",
                cmmnhlpr.themeStyles.buttons,
                (!isTapeInserted || !isPlayerReady) && "opacity-50 cursor-not-allowed",
              )}
              disabled={!isTapeInserted || !isPlayerReady}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
              className={cn(
                "h-8 w-8 rounded-full",
                cmmnhlpr.themeStyles.buttons,
                (!isTapeInserted || !isPlayerReady) && "opacity-50 cursor-not-allowed",
              )}
              disabled={!isTapeInserted || !isPlayerReady}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className={cn(
                "flex-1",
                "[&>span:first-child]:h-1.5",
                "[&>span:first-child]:bg-gray-400/30",
                "[&>span:first-child_span]:bg-red-500",
                "[&_[role=slider]]:h-3",
                "[&_[role=slider]]:w-3",
                "[&_[role=slider]]:border-0",
                "[&_[role=slider]]:bg-red-500",
                (!isTapeInserted || !isPlayerReady) && "opacity-50 pointer-events-none",
              )}
              disabled={!isTapeInserted || !isPlayerReady}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
