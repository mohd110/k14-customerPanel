'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="phone-screen min-h-[100dvh] bg-black">
      {/* Flyer at full width, page scrolls if taller than the screen (ratio 372 × 821) */}
      <div className="relative mx-auto w-full max-w-md select-none" style={{ aspectRatio: '372 / 821' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.png"
          alt="K14 Bakers — Book your Tabarruk"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* BOOK YOUR TABARRUK panel → login */}
        <Link
          href="/login"
          aria-label="Book your Tabarruk"
          className="absolute left-[9%] top-[34.4%] h-[9.4%] w-[82%] rounded-lg transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />

        {/* Phone panel → open dial pad */}
        <a
          href="tel:+917080166663"
          aria-label="Call +91 70801 66663"
          className="absolute left-[10%] top-[81.4%] h-[7.4%] w-[80%] rounded-xl transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />
      </div>
    </div>
  )
}
