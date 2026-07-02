'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage, t } from '@/lib/k14-store'

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)
  const { lang } = useLanguage()
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col relative overflow-hidden bg-black">
      {/* ── Ya Hussain watermark + dome backdrop ── */}
      <div className="absolute inset-0 pointer-events-none select-none flex flex-col items-center justify-center" aria-hidden>
        <span className="ya-hussain-watermark text-[120px] -mt-20" dir="rtl">يا حسين</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/karbala-dome.svg" alt="" className="absolute top-[14%] w-44 opacity-[0.08]" />
      </div>
      {/* Subtle red glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#e23744] opacity-[0.12] blur-3xl pointer-events-none" aria-hidden />

      {/* ── Top label ── */}
      <div className="flex justify-center pt-14 relative z-10">
        <span className="text-[11px] font-bold tracking-[0.35em] text-gold uppercase">Ya Hussain (عليه السلام)</span>
      </div>

      {/* ── Center content ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 relative z-10"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <img
          src="/new-logo.jpeg"
          alt="BookMyTabarruk"
          className="w-56 h-56 object-contain mb-6 drop-shadow-2xl"
        />

        {/* Tagline */}
        <p className="mt-1 text-base text-neutral-400 italic text-center font-medium">
          {t('The taste worth gathering for', 'वह स्वाद जिसके लिए सब जुटते हैं', lang)}
        </p>
      </div>

      {/* ── Bottom section ── */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6 relative z-10">
        {/* CTA Button */}
        <Link
          href="/menu"
          className="w-full h-14 bg-[#e23744] hover:bg-[#c52d39] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#e23744]/30"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
          }}
        >
          {t('Get Started', 'शुरू करें', lang)}
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
