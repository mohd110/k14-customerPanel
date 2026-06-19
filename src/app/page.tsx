'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { DAILY_OFFERINGS } from '@/lib/k14-data'

function useCountdown(start = { h: 2, m: 45, s: 30 }) {
  const [t, setT] = useState(start)
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let { h, m, s } = p
        if (h === 0 && m === 0 && s === 0) return p
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function SplashPage() {
  const { h, m, s } = useCountdown()

  return (
    <div className="phone-screen min-h-[100dvh] bg-[#0e0b08] text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-10 pt-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/k14/shrine-courtyard.png"
          alt="Shrine courtyard"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#0e0b08]/55 to-[#0e0b08]" aria-hidden />

        <div className="relative z-10 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/k14-logo.png" alt="K14 Bakers" className="w-60 max-w-[78%] object-contain drop-shadow-[0_8px_30px_rgba(212,175,55,0.3)]" />
          <p className="mt-3 text-xs text-white/60">Tabarruk at your doorstep</p>

          <Link
            href="/login"
            className="mt-7 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#d8434f] to-[#b02029] text-sm font-bold tracking-[0.15em] text-white shadow-lg shadow-[#b02029]/30 transition-transform active:scale-[0.98]"
          >
            BEGIN KHIDMAH <ArrowRight className="size-4" />
          </Link>

          {/* Countdown card */}
          <div className="mt-7 w-full max-w-xs rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur">
            <p className="text-[10px] font-bold tracking-[0.25em] text-[#d4af37]/80">
              ORDER FOR NEXT MAJLIS
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 font-serif-display">
              {[
                { v: h, l: 'HRS' },
                { v: m, l: 'MIN' },
                { v: s, l: 'SEC' },
              ].map((u, i) => (
                <div key={u.l} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">{pad(u.v)}</span>
                    <span className="text-[9px] tracking-[0.2em] text-white/40">{u.l}</span>
                  </div>
                  {i < 2 && <span className="-mt-3 text-2xl text-[#d4af37]/60">:</span>}
                </div>
              ))}
            </div>
          </div>

          <Link href="/menu" className="mt-6 flex items-center gap-1 text-[11px] font-semibold tracking-[0.2em] text-white/50 hover:text-white">
            EXPLORE MENU <ChevronDown className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="px-6 py-8 text-center">
        <div className="mx-auto mb-5 h-1 w-1 rounded-full bg-[#d4af37]/50" />
        <span className="inline-block rounded-full border border-white/10 px-3 py-1 text-[9px] font-bold tracking-[0.25em] text-white/50">
          TABARRUK MENU
        </span>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/60">
          Carefully prepared traditional meals and tabarruk items for the sanctity of the occasion.
        </p>
      </section>

      {/* ── Daily Offerings ── */}
      <section className="px-6 pb-10">
        <h2 className="mb-4 text-[11px] font-bold tracking-[0.25em] text-[#d4af37]">DAILY OFFERINGS</h2>
        <div className="space-y-5">
          {DAILY_OFFERINGS.map((o) => (
            <Link
              key={o.id}
              href="/menu"
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#17120c]"
            >
              <div className="relative h-44 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt={o.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[9px] font-bold tracking-[0.25em] text-[#d4af37]">{o.label}</span>
                  <h3 className="font-serif-display text-xl font-bold text-white">{o.name}</h3>
                  <p className="text-xs text-white/60">{o.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/k14-logo.png" alt="K14 Bakers" className="mx-auto w-28 object-contain opacity-90" />
        <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-[11px] text-white/40">
          <Link href="/menu" className="hover:text-white">Stories &amp; Info</Link>
          <Link href="/menu" className="hover:text-white">Help &amp; About</Link>
          <Link href="/menu" className="hover:text-white">Customer</Link>
          <Link href="/menu" className="hover:text-white">Support</Link>
        </div>
        <p className="mt-6 text-[11px] italic text-white/30">
          &ldquo;Every day is Ashura, every land is Karbala.&rdquo;
        </p>
        <p className="mt-2 text-[9px] tracking-[0.2em] text-white/20">© 2026 K14 · TABBRUK SERVICE</p>
      </footer>
    </div>
  )
}
