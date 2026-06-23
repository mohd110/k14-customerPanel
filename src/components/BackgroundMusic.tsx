'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Drop your audio file at: public/bg-music.mp3  (or change the path below).
const TRACK_SRC = '/bg-music.mp3'
const STORAGE_KEY = 'k14-music-muted'

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Start muted by default so we never blast audio unexpectedly; the user
  // toggles it on. Remember their choice across visits.
  const [muted, setMuted] = useState(true)

  // Load the saved preference once on mount.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved === 'false') setMuted(false)
  }, [])

  // Browsers block autoplay until the user interacts with the page. We arm a
  // one-time listener so playback can begin on the first tap/click/keypress.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const tryPlay = () => {
      if (!audioRef.current) return
      audioRef.current.play().catch(() => {})
    }

    const onFirstInteraction = () => {
      tryPlay()
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }

    if (!muted) {
      // Attempt right away (works if a gesture already happened), and also
      // arm the fallback for the very first interaction.
      tryPlay()
      window.addEventListener('pointerdown', onFirstInteraction)
      window.addEventListener('keydown', onFirstInteraction)
    }

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [muted])

  function toggle() {
    const next = !muted
    setMuted(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    const audio = audioRef.current
    if (!audio) return
    if (next) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? 'Play background music' : 'Mute background music'}
        className="fixed bottom-24 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#17120c]/90 text-[#d4af37] shadow-[0_4px_14px_rgba(0,0,0,0.5)] backdrop-blur transition-transform active:scale-95"
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </>
  )
}
