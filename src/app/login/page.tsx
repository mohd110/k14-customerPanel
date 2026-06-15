'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, MapPin, Lock, Heart, ShieldCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginInner() {
  const [identifier, setIdentifier] = useState('') // email OR phone
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/menu'

  const isEmail = identifier.includes('@')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Enter your email/phone and password')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const creds = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password }
    const { error } = await supabase.auth.signInWithPassword(creds)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  async function handleSignUp() {
    if (!identifier || !password) {
      toast.error('Enter an email/phone and password to create an account')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const payload = isEmail
      ? { email: identifier, password, options: { data: { role: 'customer' } } }
      : { phone: identifier, password, options: { data: { role: 'customer', phone: identifier } } }
    const { data, error } = await supabase.auth.signUp(payload)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    if (data.session) {
      toast.success('Account created')
      router.push(redirect)
      router.refresh()
    } else {
      toast.success('Account created — confirm via the link/OTP sent, then log in')
    }
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
          <h1 className="font-serif-display text-5xl font-bold tracking-tight k14-gold-gradient leading-none">
            k14
          </h1>
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
            onSubmit={handleLogin}
            className="rounded-2xl border border-[#d4af37]/15 bg-[#17120c]/90 px-6 pb-7 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-[#d4af37]/80">
              EMAIL / PHONE
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or phone number"
              autoComplete="username"
              className="mb-5 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50 transition-colors"
            />

            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37]/80">PASSWORD</label>
              <button type="button" className="text-[11px] font-semibold text-[#d4af37] hover:underline">
                Forgot?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="mb-6 h-12 w-full rounded-lg border border-white/10 bg-black/40 px-4 text-sm tracking-widest text-white placeholder:text-white/30 outline-none focus:border-[#d4af37]/50 transition-colors"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c45f] to-[#c79a2b] text-sm font-bold text-[#1a1206] shadow-md shadow-[#d4af37]/20 transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <>Login <ArrowRight className="size-4" /></>}
            </button>

            <p className="mt-7 text-center text-xs text-white/50">Don&apos;t have an account?</p>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="mt-1 block w-full text-center text-sm font-bold text-[#d4af37] hover:underline disabled:opacity-60"
            >
              Create Khidmah Account
            </button>
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
              <span className="text-[9px] font-bold tracking-[0.15em]">KARBALA 14</span>
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
