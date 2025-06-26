"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Song } from "@/components/retro-tape-player"
import { cmmnhlpr } from "@/lib/commonhelper"
import { cn } from "@/lib/utils"
import { Trash } from "lucide-react"
import { ConfettiButton } from "@/components/confetti/confetti-wrapper"

// Initial empty songs array
const initialSongs: Song[] = []

export default function Home() {
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>(initialSongs)
  const [inputUrl, setInputUrl] = useState("")
  const [to, setTo] = useState("")
  const [error, setError] = useState("")

  // Function to extract YouTube video ID from various YouTube URL formats
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const handleAddSong = () => {
    if (songs.length >= 5) {
      setError("Maximum of 5 songs allowed in the mixtape!")
      return
    }

    const videoId = extractYouTubeId(inputUrl)
    if (!videoId) {
      setError("Invalid YouTube URL. Please enter a valid YouTube video link.")
      return
    }

    // Add the new song to the mixtape
    setSongs([...songs, {
      id: videoId,
      title: `Song ${songs.length + 1}`, // Placeholder title
      artist: "Unknown Artist",          // Placeholder artist
      duration: 0                       // Will be populated by YouTube API
    }])

    setInputUrl("")
    setError("")
  }

  const handleRemoveSong = (index: number) => {
    const newSongs = [...songs]
    newSongs.splice(index, 1)
    setSongs(newSongs)
  }

  const handleCreateMixtape = () => {
    if (songs.length === 0) {
      setError("Please add at least one song to your mixtape!")
      return
    }

    // Extract video IDs and create query parameter
    const videoIds = songs.map(song => song.id).join(',')

    // Wait for 5 seconds before navigating
    setTimeout(() => {
      // Navigate to the playback page with video IDs in query parameters
      router.push(`/mixtape/playback?v=${encodeURIComponent(videoIds)}&to=${encodeURIComponent(to)}`)
    }, 3000) // 5000 milliseconds = 5 seconds
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 ">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      <h1 className="text-4xl font-extrabold mb-8 text-center text-stone-800 font-mono tracking-tight">Mixtape</h1>

      <div className={cn("relative transition-transform duration-500 h-44 w-80 flex-col rounded-xl border-8 bg-amber-100 mb-8 hover:-rotate-3",
        cmmnhlpr.themeStyles.tape,

      )}>
        <div className="absolute top-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute top-2 right-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute bottom-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute right-2 bottom-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="flex h-1/2 w-full items-center">
          <div className="z-20 mx-auto h-12 w-[90%] rounded-sm bg-amber-100 flex items-center justify-center" >
            <div className="text-center text-lg font-bold text-black font-mono ">
              <p>{"YOUR MIX"}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto flex h-12 w-[60%] justify-between items-center rounded-xl border-2 border-white bg-amber-200 p-2">
          <div className="h-8 w-8 rounded-full border-4 bg-stone-700 border-stone-400" />
          <div className="h-8 w-20 rounded-sm border-4 border-amber-800 bg-amber-950" />
          <div className="h-8 w-8 rounded-full border-4 bg-stone-700 border-stone-400" />
        </div>
      </div>

      {/* Form to add songs */}
      <div className={cn("w-full max-w-md mb-6 p-6 rounded-xl shadow-lg border", cmmnhlpr.themeStyles.body)}>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Who is the mixtape for?"
            value={to}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
            className="h-12 text-base bg-stone-500 border-2 border-stone-600 text-white"
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Paste YouTube URL"
              value={inputUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddSong()}
              className="h-12 text-base flex-1 bg-stone-500 border-2 border-stone-600 text-white"
            />
            <Button
              className="h-12 px-6 border-2 border-stone-600 bg-stone-500 hover:bg-stone-600 text-white transition-colors"
              onClick={handleAddSong}
              disabled={songs.length >= 5}
            >
              Add
            </Button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="text-sm text-gray-500 mt-3">
          {songs.length}/5 songs added
        </div>

        {/* Song list */}
        {songs.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3 text-gray-800">Your Mixtape:</h3>
            <ul className="space-y-2">
              {songs.map((song, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border-2 border-[#d3c59e]">
                  <span className="font-medium text-gray-700">
                    Track {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSong(index)}
                    className="text-red-400 hover:text-red-400 hover:bg-red-100 bg-red-50"
                  >
                    <Trash />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Mixtape button */}
        <ConfettiButton className="w-full mt-6 h-12 bg-amber-500 hover:bg-amber-600 text-white transition-colors text-base font-medium"
          disabled={songs.length === 0}
          onClick={handleCreateMixtape}>

          Create Mixtape
        </ConfettiButton>
      </div>
      <div className="mt-6 text-center text-sm text-gray-500">
          <p className="text-xs text-stone-400 font-mono">"Every great artist is a thief." - Pablo Picasso</p>
          {/* <p className="mt-2 underline text-sm font-extralight text-black underline-offset-1"><Link href="/">
            Create a new mixtape
          </Link></p> */}
        </div>
    </div>
  )
}

