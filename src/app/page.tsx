'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function SplashPage() {
  return (
    <div className="phone-screen min-h-[100dvh] bg-black">
      {/* Flyer at full width, page scrolls if taller than the screen (ratio 1592 × 3546) */}
      <div className="relative mx-auto w-full max-w-md select-none" style={{ aspectRatio: '1592 / 3546' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.png"
          alt="K14 Bakers — Book your Tabarruk"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Primary CTA — blood-red "Book Your Tabarruk" plate (covers the painted box) */}
        <Link
          href="/login"
          autoFocus
          aria-label="Book your Tabarruk"
          className="absolute left-[3%] top-[32.4%] flex h-[9.1%] w-[94%] flex-col items-center justify-center rounded-2xl border border-[#f4d77a]/40 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.55)] transition-transform active:scale-[0.985]"
          style={{ backgroundImage: 'linear-gradient(180deg,#B81D2C 0%,#8A0F1B 52%,#5E0A12 100%)' }}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#f4d77a] sm:text-[10px]">
            Click Here
          </span>
          <span className="font-serif-display text-lg font-bold tracking-wide text-white sm:text-xl">
            BOOK YOUR TABARRUK
          </span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[10px]">
            For Majlis, Azadari &amp; Niyaz
          </span>
        </Link>

        {/* Secondary — dark call plate (covers the gold phone box) */}
        <a
          href="tel:+917080166663"
          aria-label="Call +91 70801 66663"
          className="absolute left-[4.5%] top-[81.7%] flex h-[8.2%] w-[89%] items-center justify-center gap-2.5 rounded-2xl border border-[#d6b25a]/45 bg-[#0d0a06] text-[#e9c45f] shadow-[0_4px_14px_rgba(0,0,0,0.5)] transition-transform active:scale-[0.985]"
        >
          <Phone className="size-4 sm:size-[18px]" strokeWidth={2.25} />
          <span className="flex flex-col leading-tight">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#e9c45f]/70">
              For Queries
            </span>
            <span className="text-sm font-bold tracking-wide sm:text-base">+91 7080166663</span>
          </span>
        </a>
      </div>
    </div>
  )
}
