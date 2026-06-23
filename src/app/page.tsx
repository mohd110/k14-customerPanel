'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="phone-screen min-h-[100dvh] bg-black">
      {/* Flyer at full width, page scrolls if taller than the screen (ratio 941 × 1672) */}
      <div className="relative mx-auto w-full max-w-md select-none" style={{ aspectRatio: '941 / 1672' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.png"
          alt="K14 Bakers — Savor the blessings of Muharram Tabarruk"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Whole-flyer tap target so the CTA can never be missed. */}
        <Link href="/menu" aria-label="Book your Tabarruk" className="absolute inset-0" />

        {/* Transparent hot-zone sitting on top of the baked-in red
            "BOOK YOUR TABARRUK" button — gives a press animation on tap. */}
        <Link
          href="/menu"
          autoFocus
          aria-label="Book your Tabarruk"
          className="absolute left-[12%] top-[52.3%] h-[6.5%] w-[76%] rounded-full transition-transform active:scale-[0.97]"
        />
      </div>
    </div>
  )
}
