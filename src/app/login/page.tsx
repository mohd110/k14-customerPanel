'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, MapPin, Lock, Heart, ShieldCheck, Loader2, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Normalise an Indian mobile number to E.164 (+91…). Bare 10-digit numbers
// get +91 prepended; anything already in +CC form is kept.
function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (raw.trim().startsWith('+')) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return null
}

function LoginInner() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/menu'

  // Free, contact-only login — no SMS/OTP. The phone number is both the
  // identifier and (with a fixed suffix) the password, so returning numbers
  // sign in and new numbers sign up automatically. Name/email are collected
  // at checkout. Requires Supabase → Auth → Phone: enabled, "Confirm phone" OFF.
  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    const e164 = toE164(phone)
    if (!e164) {
      toast.error('Enter a valid mobile number')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const password = `${e164}#k14-tabarruk`

    let { error } = await supabase.auth.signInWithPassword({ phone: e164, password })
    // First time on this number → create the account, then we're signed in.
    if (error) {
      const res = await supabase.auth.signUp({
        phone: e164,
        password,
        options: { data: { role: 'customer', phone: e164 } },
      })
      error = res.error
    }
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="phone-screen min-h-[100dvh] flex flex-col bg-[#0e0b08] relative overflow-hidden">
      {/* shrine banner */}
      <div className="relative h-40 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/k14/shrine-night.png" alt="Shrine" className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0b08]" />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8 -mt-10 relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/k14-logo.png" alt="K14 Bakers" className="w-52 object-contain" />
          <p className="mt-2 text-[11px] font-semibold tracking-[0.35em] text-[#d4af37]/80">
            TABBRUK SERVICE
          </p>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute left-1/2 -top-5 -translate-x-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#17120c]">
              <ShieldCheck className="size-5 text-[#d4af37]" />
            </div>
          </div>

          <form
            onSubmit={handleContinue}
            className="rounded-2xl border border-[#d4af37]/15 bg-[#17120c]/90 px-6 pb-7 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#d4af37]/80">
              MOBILE NUMBER
            </label>
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 focus-within:border-[#d4af37]/50 transition-colors">
              <Phone className="size-4 shrink-0 text-[#d4af37]/70" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] shadow-md shadow-[#d4af37]/20 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}
            </button>

            <p className="mt-7 text-center text-[11px] leading-relaxed text-white/40">
              Just your number to continue — no password needed. Your name and
              other details are added when you check out.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10">
          <p className="text-center text-[11px] italic text-white/30">
            &ldquo;Every day is Ashura, every land is Karbala.&rdquo;
          </p>
          <div className="mt-5 flex items-center justify-center gap-6 text-white/25">
            <MapPin className="size-4" />
            <Lock className="size-4" />
            <Heart className="size-4" />
            <span className="ml-2 flex items-center gap-1 text-[#d4af37]/50">
              <ShieldCheck className="size-4" />
              <span className="text-[9px] font-bold tracking-[0.15em]">SALUTE 72</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="phone-screen min-h-[100dvh] bg-[#0e0b08]" />}>
      <LoginInner />
    </Suspense>
  )
}
