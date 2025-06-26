"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { RetroTapePlayer } from "@/components/retro-tape-player"
import { Button } from "@/components/ui/button"
import { Song } from "@/components/retro-tape-player"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function PlaybackContent() {
  const [songs, setSongs] = useState<Song[]>([])
  const [to, setTo] = useState<string>("For You")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get the full URL including search params
  const getFullUrl = () => {
    const url = `${window.location.origin}${pathname}`
    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  const copyToClipboard = async () => {
    const url = getFullUrl()

    try {
      await navigator.clipboard.writeText(url)
    } catch (err) {
      //   toast({
      //     title: "Failed to copy",
      //     description: "Could not copy the URL to clipboard",
      //     variant: "destructive",
      //   })
      console.log("failed to copy");

    }
  }

  useEffect(() => {
    // Get video IDs from query parameter
    const videoParam = searchParams.get("v")
    const toParam = searchParams.get("to")

    if (toParam) {
      setTo(toParam)
    }

    if (!videoParam) {
      setError("No songs found in the mixtape. Please go back and add some songs.")
      setIsLoading(false)
      return
    }

    // Split the comma-separated video IDs
    const videoIds = videoParam.split(",")

    if (videoIds.length === 0) {
      setError("No valid songs found in the mixtape.")
      setIsLoading(false)
      return
    }

    // Create song objects from video IDs
    const songList: Song[] = videoIds.map((id, index) => ({
      id: id,
      title: `Song ${index + 1}`,
      artist: "YouTube",
      duration: 0, // Will be populated by YouTube API
    }))

    setSongs(songList)
    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl mb-2 text-black font-mono font-extrabold">Loading your mixtape...</h2>
          <p className="text-gray-500">Getting your songs ready to play.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Oops!</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      <div className="w-full max-w-md">
        {/* To */}
        {/* <div className="text-center text-lg font-bold text-black font-mono">
          <p>{to}'s Playlist</p>
        </div> */}

        {songs.length > 0 ? (
          <RetroTapePlayer songs={songs} to={to} />
        ) : (
          <div className="text-center text-gray-500">
            No songs found in the mixtape.
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="text-xs text-stone-400">Copy the link of your mixtape <span onClick={copyToClipboard} className="underline underline-offset-1 cursor-copy">here!</span></p>
          <p className="mt-2 underline text-sm font-extralight text-black underline-offset-1"><Link href="/">
            Create a new mixtape
          </Link></p>
        </div>
      </div>
    </div>
  )
}

export default function PlaybackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl mb-2 text-black font-mono font-extrabold">Loading your mixtape...</h2>
          <p className="text-gray-500">Getting your songs ready to play.</p>
        </div>
      </div>
    }>
      <PlaybackContent />
    </Suspense>
  )
} 