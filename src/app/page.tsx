'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="phone-screen flex h-[100dvh] items-center justify-center bg-black">
      {/* Flyer shown whole (natural ratio 759 × 1600); its painted button is the CTA */}
      <div className="relative w-full max-w-md select-none" style={{ aspectRatio: '759 / 1600' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.jpeg"
          alt="K14 Bakers — Book your Tabarruk"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* BOOK YOUR TABARRUK gold pill → login */}
        <Link
          href="/login"
          aria-label="Book your Tabarruk"
          className="absolute left-[15%] top-[75.2%] h-[5.9%] w-[70%] rounded-full transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />

        {/* Phone panel → open dial pad */}
        <a
          href="tel:+917080166663"
          aria-label="Call +91 70801 66663"
          className="absolute left-[13%] top-[87.6%] h-[6.1%] w-[55%] rounded-xl transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />
      </div>
    </div>
  )
}
