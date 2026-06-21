'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="phone-screen flex h-[100dvh] items-center justify-center bg-black">
      {/* Flyer fitted to screen height (natural ratio 864 × 1821); its painted button is the CTA */}
      <div className="relative h-full max-w-full select-none" style={{ aspectRatio: '864 / 1821' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.png"
          alt="K14 Bakers — Book your Tabarruk"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* BOOK YOUR TABARRUK gold button → login */}
        <Link
          href="/login"
          aria-label="Book your Tabarruk"
          className="absolute left-[24%] top-[46.5%] h-[5.2%] w-[53%] rounded-2xl transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />

        {/* Phone panel → open dial pad */}
        <a
          href="tel:+917080166663"
          aria-label="Call +91 70801 66663"
          className="absolute left-[21%] top-[55.6%] h-[5.3%] w-[46%] rounded-2xl transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />
      </div>
    </div>
  )
}
