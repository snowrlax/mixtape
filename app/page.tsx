"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Song } from "@/components/retro-tape-player"

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

    // Navigate to the playback page with video IDs in query parameters
    router.push(`/mixtape/playback?v=${encodeURIComponent(videoIds)}&to=${encodeURIComponent(to)}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 font-mono tracking-tight">Create Your Mixtape</h1>

      {/* Form to add songs */}
      <div className="w-full max-w-md mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Who is the mixtape for?"
            value={to}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
            className="h-12 text-base"
          />
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Paste YouTube URL"
              value={inputUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUrl(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAddSong()}
              className="h-12 text-base flex-1"
            />
            <Button 
              className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white transition-colors" 
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
                <li key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="font-medium text-gray-700">
                    Track {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSong(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Mixtape button */}
        <Button
          className="w-full mt-6 h-12 bg-amber-500 hover:bg-amber-600 text-white transition-colors text-base font-medium"
          disabled={songs.length === 0}
          onClick={handleCreateMixtape}
        >
          Create Mixtape
        </Button>
      </div>
    </div>
  )
}

