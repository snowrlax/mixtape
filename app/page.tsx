"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Song } from "@/components/retro-tape-player"
import { cmmnhlpr } from "@/lib/commonhelper"
import { cn } from "@/lib/utils"
import { Trash } from "lucide-react"
import { ConfettiButton } from "@/components/confetti/confetti-wrapper"
import { CollageAsset } from "@/components/collage/collage-asset"
import { AnimatePresence, motion } from "motion/react"

/** A song plus a local id, so list rows keep their identity while animating. */
type DraftSong = Song & { uid: number }

/** Gentle decelerating ease shared by the form transitions. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const

// Initial empty songs array
const initialSongs: DraftSong[] = []

export default function Home() {
  const router = useRouter()
  const [songs, setSongs] = useState<DraftSong[]>(initialSongs)
  const nextUid = useRef(0)
  const [inputUrl, setInputUrl] = useState("")
  const [to, setTo] = useState("")
  const [error, setError] = useState("")
  // Driven by hovering the cassette, but rendered behind the form card below it.
  const [collageOut, setCollageOut] = useState(false)

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
      uid: nextUid.current++,
      id: videoId,
      title: `Song ${songs.length + 1}`, // Placeholder title
      artist: "Unknown Artist",          // Placeholder artist
      duration: 0                       // Will be populated by YouTube API
    }])

    setInputUrl("")
    setError("")
  }

  const handleRemoveSong = (uid: number) => {
    setSongs(songs.filter((song) => song.uid !== uid))
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
      // `owner=1` marks this as the creator's own view; it is stripped from the shared link
      router.push(`/mixtape/playback?v=${encodeURIComponent(videoIds)}&to=${encodeURIComponent(to)}&owner=1`)
    }, 500) // 5000 milliseconds = 5 seconds
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 ">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      {/* Collage layer: waits just off the left and right edges of the screen
          and swings up into frame while the cassette is hovered. Hidden below md,
          where there is no room beside the card (and no hover to trigger it). */}
      <CollageAsset
        src="/assets/frenchvilla.png"
        open={collageOut}
        from={{ x: "-100%", rotate: -55 }}
        to={{ x: "-6%", rotate: 6 }}
        delay={0.08}
        className="hidden md:block fixed bottom-0 left-0 h-80"
      />
      <CollageAsset
        src="/assets/rose.png"
        open={collageOut}
        from={{ x: "100%", rotate: 55 }}
        to={{ x: "6%", rotate: -6 }}
        className="hidden md:block fixed -bottom-8 right-0 h-72"
      />

      <h1 className="text-4xl font-extrabold mb-8 text-center text-stone-800 font-mono tracking-tight flex gap-1 items-center"> <span className="">Mi</span><span className="font-miltonian-tattoo text-4xl">x</span><span className="">tape</span></h1>

      <div
        onMouseEnter={() => setCollageOut(true)}
        onMouseLeave={() => setCollageOut(false)}
        className={cn("relative transition-transform duration-500 h-44 w-80 flex-col rounded-xl border-8 bg-amber-100 mb-8 rotate-2 hover:rotate-0",
          cmmnhlpr.themeStyles.tape,

        )}>
        <div className="absolute top-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute top-2 right-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute bottom-2 left-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="absolute right-2 bottom-2 z-10 h-2 w-2 rounded-full border-2 border-amber-100 bg-black" />
        <div className="flex h-1/2 w-full items-center">
          <div className="z-20 mx-auto h-12 w-[90%] rounded-sm bg-amber-100 flex items-center justify-center" >
            <div className="text-center text-lg text-black font-gloria-hallelujah">
              <p>{"Big Booty Mix Vol 2"}</p>
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
      <div className="relative w-full max-w-md mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className={cn("relative z-10 w-full p-6 rounded-xl shadow-lg border", cmmnhlpr.themeStyles.body)}
        >
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
              {/* No transition-colors here: it would narrow Button's transition-all
                  and the pressed scale would snap instead of easing. */}
              <Button
                className="h-12 px-6 border-2 border-stone-600 bg-stone-500 hover:bg-stone-600 text-white active:scale-[0.96]"
                onClick={handleAddSong}
                disabled={songs.length >= 5}
              >
                Add
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key="error"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <p className="text-red-500 text-sm pt-2">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-sm text-gray-500 mt-3">
            {songs.length}/5 songs added
          </div>

          {/* Song list. Every row animates its own height, so the card expands as
              a side effect of its contents growing - no layout animation, and so
              no squashed text while it resizes. */}
          <AnimatePresence initial={false}>
            {songs.length > 0 && (
              <motion.div
                key="song-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="pt-6">
                  <h3 className="font-medium mb-3 text-gray-800">Your Mixtape:</h3>
                  <ul>
                    <AnimatePresence initial={false}>
                      {songs.map((song, index) => (
                        <motion.li
                          key={song.uid}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          {/* Gap lives inside the animated box so it collapses with the row */}
                          <div className="pb-2">
                            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border-2 border-[#d3c59e]">
                              <span className="font-medium text-gray-700">
                                Track {index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSong(song.uid)}
                                className="text-red-400 hover:text-red-400 hover:bg-red-100 bg-red-50 active:scale-90"
                              >
                                <Trash />
                              </Button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Mixtape button */}
          <ConfettiButton className="w-full mt-6 h-12 bg-amber-500 hover:bg-amber-600 text-white text-base font-medium active:scale-[0.98]"
            disabled={songs.length === 0}
            onClick={handleCreateMixtape}>

            Create Mixtape
          </ConfettiButton>
        </motion.div>
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

