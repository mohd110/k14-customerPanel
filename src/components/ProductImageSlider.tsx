'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// A compact image slider for a product's packaging shots (Single Pack /
// Bulk Packaging). Supports tap arrows, swipe, and dot navigation.
export default function ProductImageSlider({
  images,
  captions,
  alt,
  available = true,
}: {
  images: string[]
  captions?: string[]
  alt: string
  available?: boolean
}) {
  const [i, setI] = useState(0)
  const startX = useRef<number | null>(null)
  const n = images.length
  const go = (next: number) => setI((next + n) % n)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1)
    startX.current = null
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-white">
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`${alt} — ${captions?.[idx] ?? `image ${idx + 1}`}`}
            className={`h-full w-full shrink-0 object-contain transition-all ${available ? '' : 'grayscale'}`}
            draggable={false}
          />
        ))}
      </div>

      {!available && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-md border border-white/30 bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white">
            Out of stock
          </span>
        </div>
      )}

      {n > 1 && (
        <>
          {/* Caption badge */}
          {captions?.[i] && (
            <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              {captions[i]}
            </span>
          )}

          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(i - 1)}
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(i + 1)}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((src, idx) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to image ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? 'w-4 bg-[#d4af37]' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
