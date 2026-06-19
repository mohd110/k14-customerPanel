'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!agreed) { toast.error('Please agree to the Terms & Conditions'); return }
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'customer', full_name: name, phone } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signInErr) {
      toast.success('Account created! Please check your email to confirm.')
      router.push('/login')
      return
    }

    toast.success('Welcome to K14!')
    setShowSplash(true)
    setLoading(false)

    setTimeout(() => {
      router.push('/location')
      router.refresh()
    }, 2000)
  }

  if (showSplash) {
    return (
      <div
        className="min-h-[100dvh] phone-screen flex flex-col items-center justify-center relative overflow-hidden bg-black"
      >
        {/* Ya Hussain watermark */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center" aria-hidden>
          <span className="ya-hussain-watermark text-[110px]" dir="rtl">يا حسين</span>
        </div>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#e23744] opacity-[0.12] blur-3xl pointer-events-none" aria-hidden />

        {/* Center Logo Container */}
        <div className="flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in-95 duration-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/k14-logo.png"
            alt="K14 Bakers"
            className="w-60 max-w-[80%] object-contain mb-4 drop-shadow-[0_8px_40px_rgba(226,55,68,0.25)]"
          />

          <p className="text-xs text-neutral-400 mt-1 font-semibold italic text-center">
            The taste worth gathering for
          </p>

          {/* Personalized Greeting */}
          <div className="mt-8 bg-[#2a1416]/80 px-4 py-2 rounded-2xl border border-[#3a1f22]/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#e23744] animate-ping" />
            <span className="text-[11px] font-extrabold text-[#e23744]">
              Creating Account for {name || 'Foodie'}...
            </span>
          </div>

          <p className="text-[10px] text-neutral-400 mt-3 font-semibold">
            Preparing your kitchen…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-neutral-900">

      {/* ── Hero: food photo with brand overlay ── */}
      <div className="relative h-56 flex-shrink-0 overflow-hidden">
        {/* Background food image via CSS gradient + emoji fallback */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80')`,
          }}
        />
        {/* Dark scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Brand logo over the image */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/k14-logo.svg"
            alt="K14"
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* ── White form card overlapping hero ── */}
      <div className="flex-1 bg-neutral-900 rounded-t-3xl -mt-5 relative z-10 px-6 pt-6 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-neutral-400 mt-0.5">Join the circle of authentic flavors.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 tracking-wide">Full Name</label>
            <div className="relative flex items-center border-b border-neutral-700 pb-2 focus-within:border-[#e23744] transition-colors">
              <User className="size-4 text-neutral-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 tracking-wide">Email Address</label>
            <div className="relative flex items-center border-b border-neutral-700 pb-2 focus-within:border-[#e23744] transition-colors">
              <Mail className="size-4 text-neutral-500 mr-3 flex-shrink-0" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 tracking-wide">Phone Number</label>
            <div className="relative flex items-center border-b border-neutral-700 pb-2 focus-within:border-[#e23744] transition-colors">
              <Phone className="size-4 text-neutral-500 mr-3 flex-shrink-0" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 tracking-wide">Password</label>
            <div className="relative flex items-center border-b border-neutral-700 pb-2 focus-within:border-[#e23744] transition-colors">
              <Lock className="size-4 text-neutral-500 mr-3 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-500 hover:text-neutral-400 transition-colors ml-2"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#e23744] flex-shrink-0"
            />
            <span className="text-xs text-neutral-400 leading-relaxed">
              I agree to the{' '}
              <span className="text-[#e23744] font-semibold">Terms &amp; Conditions</span>
              {' '}and{' '}
              <span className="text-[#e23744] font-semibold">Privacy Policy</span>
            </span>
          </label>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-[#e23744] hover:bg-[#c52d39] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-[#e23744]/30 cursor-pointer"
          >
            <span>{loading ? 'Creating account…' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-[10px] font-semibold text-neutral-500 tracking-widest">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-700 hover:bg-neutral-900 rounded-xl text-sm font-semibold text-neutral-200 transition-colors cursor-pointer shadow-sm"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="h-12 flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-700 hover:bg-neutral-900 rounded-xl text-sm font-semibold text-neutral-200 transition-colors cursor-pointer shadow-sm"
          >
            <svg className="size-4 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#e23744] font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}