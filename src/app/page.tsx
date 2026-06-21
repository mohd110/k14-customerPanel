'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <div className="phone-screen min-h-[100dvh] bg-black">
      {/* Flyer at full width, page scrolls if taller than the screen (ratio 1592 × 3546) */}
      <div className="relative mx-auto w-full max-w-md select-none" style={{ aspectRatio: '1592 / 3546' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.png"
          alt="K14 Bakers — Book your Tabarruk"
          className="absolute inset-0 h-full w-full object-cover [image-rendering:auto]"
        />

        {/* BOOK YOUR TABARRUK panel → login (focal CTA: glows + takes initial focus) */}
        <Link
          href="/login"
          autoFocus
          aria-label="Book your Tabarruk"
          className="group absolute left-[5.1%] top-[32.8%] h-[8.3%] w-[89.7%] rounded-2xl transition-transform active:scale-[0.98] focus-visible:outline-none"
        >
          <span className="absolute inset-0 rounded-2xl shadow-[0_0_26px_rgba(244,215,122,0.5)] animate-pulse transition group-active:scale-[0.98]" />
        </Link>

        {/* Phone panel → open dial pad */}
        <a
          href="tel:+917080166663"
          aria-label="Call +91 70801 66663"
          className="absolute left-[5.1%] top-[82%] h-[7.9%] w-[87.7%] rounded-2xl transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d77a]"
        />
      </div>
    </div>
  )
}
