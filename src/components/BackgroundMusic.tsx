'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Drop your audio file at: public/bg-music.mp3  (or change the path below).
const TRACK_SRC = '/bg-music.mp3'

/**
 * Plays the background noha ONLY on the splash screen ("/"). The moment the
 * user navigates anywhere else it pauses and rewinds, so it never follows them
 * into the menu/checkout. Browsers block audio with sound until the first user
 * gesture, so we also arm a one-time interaction listener to kick it off.
 */
export default function BackgroundMusic() {
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const onSplash = pathname === '/'

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!onSplash) {
      audio.pause()
      audio.currentTime = 0
      return
    }

    const tryPlay = () => audio.play().catch(() => {})
    tryPlay() // works if the user has already interacted with the page

    // Fallback for autoplay-blocked first loads: start on the first gesture.
    const onFirstInteraction = () => {
      tryPlay()
      removeListeners()
    }
    const removeListeners = () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('touchstart', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    window.addEventListener('pointerdown', onFirstInteraction)
    window.addEventListener('touchstart', onFirstInteraction)
    window.addEventListener('keydown', onFirstInteraction)

    return removeListeners
  }, [onSplash])

  return <audio ref={audioRef} src={TRACK_SRC} loop preload="auto" />
}
