'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, Phone, ShieldCheck, HelpCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, t } from '@/lib/k14-store'

/* ─── phone normaliser ─── */
function toE164(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (raw.trim().startsWith('+')) return `+${digits}`
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return null
}

/* ─── BMT Logo SVG Component (White & Gold, transparent bg) ─── */
function BmtLogoSvg({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Glow / Halo */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 4" className="animate-bmt-spin-slow" />
      
      {/* Main White Circular Ring */}
      <circle cx="100" cy="90" r="60" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
      
      {/* Golden Dome (Mosque shape) */}
      <path d="M75 105C75 75 85 60 100 45C115 60 125 75 125 105H75Z" fill="url(#goldGradient)" />
      {/* Dome Top Spire */}
      <path d="M100 45V30M97 33H103" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
      
      {/* Flag (Ya Hussain) */}
      <path d="M100 30L125 35L100 40Z" fill="#d4af37" />
      <line x1="100" y1="30" x2="100" y2="45" stroke="#d4af37" strokeWidth="2" />
      
      {/* White Hand holding Bowl */}
      <path d="M60 120C80 140 120 140 140 120C125 122 105 122 90 115C80 110 70 112 60 120Z" fill="white" />
      {/* Bowl / Food inside */}
      <path d="M85 110C95 100 105 100 115 110H85Z" fill="#f5d77a" />
      
      {/* Definitions for Gradients */}
      <defs>
        <linearGradient id="goldGradient" x1="75" y1="45" x2="125" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5d77a" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a67c1f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ─── inner (needs useSearchParams) ─── */
function LoginInner() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/stores'
  const { lang, setLang } = useLanguage()

  useEffect(() => { setMounted(true) }, [])

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    const e164 = toE164(phone)
    if (!e164) {
      toast.error(t('Enter a valid 10-digit mobile number', 'सही मोबाइल नंबर दर्ज करें', lang))
      return
    }
    setLoading(true)
    const supabase = createClient()
    const passwordNew = `${e164}#bmt-user`
    const passwordOld = `${e164}#k14-tabarruk`

    // 1. Try sign in with the new password format
    let signInResult = await supabase.auth.signInWithPassword({ phone: e164, password: passwordNew })
    
    // 2. If it fails, retry with the old password format
    if (signInResult.error) {
      const oldSignInResult = await supabase.auth.signInWithPassword({ phone: e164, password: passwordOld })
      if (!oldSignInResult.error) {
        signInResult = oldSignInResult
      }
    }

    // 3. If signed in successfully, redirect
    if (!signInResult.error) {
      router.push(redirect)
      router.refresh()
      return
    }

    // 4. Try sign up (new user) with the new password format
    const signUpResult = await supabase.auth.signUp({
      phone: e164,
      password: passwordNew,
      options: { data: { role: 'customer', phone: e164 } },
    })

    // 5. If already registered, retry sign-in with both password formats
    if (signUpResult.error) {
      const errText = signUpResult.error.message.toLowerCase()
      if (
        errText.includes('already registered') ||
        errText.includes('already exists') ||
        errText.includes('unique constraint') ||
        signUpResult.error.status === 422
      ) {
        let retryResult = await supabase.auth.signInWithPassword({ phone: e164, password: passwordNew })
        if (retryResult.error) {
          retryResult = await supabase.auth.signInWithPassword({ phone: e164, password: passwordOld })
        }
        
        setLoading(false)
        if (retryResult.error) {
          toast.error(`${t('Sign-in failed', 'लॉगिन विफल रहा', lang)}: ${retryResult.error.message}`)
          return
        }
        router.push(redirect)
        router.refresh()
        return
      }

      setLoading(false)
      toast.error(`${t('Authentication failed', 'प्रमाणीकरण विफल रहा', lang)}: ${signUpResult.error.message}`)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  const isHindi = lang === 'hi'

  const categories = isHindi
    ? [
        { icon: '🍞', label: 'बेकरी आइटम' },
        { icon: '🍳', label: 'किचन वेयर' },
        { icon: '🍛', label: 'मुगलाई खाना' },
        { icon: '🥤', label: 'जूस & ड्रिंक्स' },
        { icon: '🍪', label: 'बिस्किट्स & स्नैक्स' },
        { icon: '🛒', label: 'FMCG प्रोडक्ट्स' },
        { icon: '🍬', label: 'मिठाई & नियाज़' },
        { icon: '📦', label: 'अन्य आइटम' },
      ]
    : [
        { icon: '🍞', label: 'Bakery Items' },
        { icon: '🍳', label: 'Kitchenware' },
        { icon: '🍛', label: 'Mughlai Food' },
        { icon: '🥤', label: 'Juices & Drinks' },
        { icon: '🍪', label: 'Biscuits & Snacks' },
        { icon: '🛒', label: 'FMCG Products' },
        { icon: '🍬', label: 'Sweets & Mithai' },
        { icon: '📦', label: 'Other Items' },
      ]

  return (
    <div
      className="phone-screen min-h-[100dvh] flex flex-col"
      style={{ background: '#FAF6F0' }}
    >
      <div
        className="relative overflow-hidden pt-6 pb-16 rounded-b-[44px] shadow-lg flex flex-col items-center text-center px-6"
        style={{ background: 'linear-gradient(180deg, #0e3d2a 0%, #072519 100%)' }}
      >
        <div className="absolute top-5 right-5 z-20 flex items-center gap-0.5 rounded-full border border-white/20 bg-white/10 p-1">
          <button
            onClick={() => setLang('en')}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
              !isHindi ? 'bg-white text-[#0e3d2a] shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
              isHindi ? 'bg-white text-[#0e3d2a] shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            हिं
          </button>
        </div>

        <div className="relative mt-2 mb-1 w-36 h-36">
          <img src="/new-logo.jpeg" alt="BookMyTabarruk" className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="-mt-10 mx-5 relative z-10 bg-white rounded-3xl shadow-xl p-6 border border-gray-100/80">
        <div className="text-center mb-5">
          <h2
            className="text-xl font-bold text-gray-900 leading-snug"
            style={isHindi ? { fontFamily: 'var(--font-devanagari), sans-serif' } : {}}
          >
            {t('Book Tabarruk Online For Your Majlis', 'अपने मजलिस का तबरूक ऑनलाइन बुक करें', lang)}
          </h2>

          <div className="niyaz-bar mt-2.5 text-xs">
            <style>{`.niyaz-bar { color: #b8952a; } .niyaz-bar::before, .niyaz-bar::after { background: linear-gradient(to right, transparent, #b8952a50, transparent); }`}</style>
            {isHindi ? 'नियाज़' : 'NIYAZ'}
            <span className="text-[#b8952a]/40">·</span>
            {isHindi ? 'बरकत' : 'BARKAT'}
            <span className="text-[#b8952a]/40">·</span>
            {isHindi ? 'इबादत' : 'IBAADAT'}
          </div>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 focus-within:border-[#0e3d2a] focus-within:ring-2 focus-within:ring-[#0e3d2a]/10 transition-all">
            <div className="flex items-center gap-1.5 px-4 py-3.5 border-r border-gray-200 shrink-0">
              <span className="text-lg">🇮🇳</span>
              <span className="text-sm font-bold text-gray-500">+91</span>
            </div>
            <div className="flex items-center gap-2 flex-1 px-3.5">
              <Phone className="size-4 shrink-0 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('Enter mobile number', 'अपना मोबाइल नंबर दर्ज करें', lang)}
                className="h-12 w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl overflow-hidden text-[15px] font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(180deg, #1a5c35 0%, #0e3d22 100%)' }}
          >
            {loading ? (
              <span className="size-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span style={isHindi ? { fontFamily: 'var(--font-devanagari), sans-serif' } : {}}>
                  {t('LOGIN / SIGN UP WITH MOBILE NUMBER', 'मोबाइल नंबर से लॉगिन करें', lang)}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="px-6 mt-7">
        <p className="mb-3.5 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e3d2a]/70">
          {t('Shop by Category', 'श्रेणी चुनें', lang)}
        </p>
        <div className="grid grid-cols-4 gap-x-3 gap-y-5">
          {categories.map((cat, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100/80 shadow-md shadow-gray-200/60 flex items-center justify-center text-2xl">
                {cat.icon}
              </div>
              <p
                className="text-[9.5px] font-bold text-gray-700 leading-tight"
                style={isHindi ? { fontFamily: 'var(--font-devanagari), sans-serif' } : {}}
              >
                {cat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-7">
        <div
          className="rounded-2xl overflow-hidden shadow-md"
          style={{
            background: 'linear-gradient(135deg, #0f2e1c 0%, #183825 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          {/* Columns */}
          <div className="flex items-stretch divide-x divide-[#d4af37]/15 px-2 py-3">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              <p className="text-[11px] font-bold text-white leading-tight">बुकमाई<span className="text-[#d4af37]">तबरुक</span></p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              <p className="text-[11px] font-bold text-white leading-tight">بک مائی <span className="text-[#d4af37]">تبرک</span></p>
            </div>
            <div className="flex-grow flex-1 flex flex-col items-center justify-center text-center px-2">
              <p className="text-[11px] font-bold text-white leading-tight">Book<span className="text-[#d4af37]">My</span>Tabarruk</p>
            </div>
          </div>
          {/* MUHARRAM | SHIA | TABARRUK Bar */}
          <div className="mx-2.5 mb-2.5 rounded-lg bg-black/50 border border-white/10 px-3 py-2 flex items-center justify-center gap-2">
            <span className="text-[10px]">🤲</span>
            <span className="text-[9.5px] font-bold tracking-[0.15em] text-white/80">
              MUHARRAM &nbsp;|&nbsp; SHIA &nbsp;|&nbsp; TABARRUK
            </span>
            <span className="text-[10px] text-[#d4af37]">☪</span>
          </div>
          {/* Hindi tags */}
          <div className="pb-2.5 text-center">
            <p className="text-[9px] text-[#d4af37]/65 tracking-[0.12em]" style={{ fontFamily: 'var(--font-devanagari), sans-serif' }}>
              — नियाज़ | बरकत | इबादत —
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FOOTER FEATURES & TAGLINE
      ══════════════════════════════════════════ */}
      <div className="px-5 mt-7 pb-8">
        {/* Features Row */}
        <div className="grid grid-cols-4 gap-3">
          {(isHindi
            ? [
                { icon: '🛡️', h: 'विश्वसनीय सेवा' },
                { icon: '🚚', h: 'समय पर डिलीवरी' },
                { icon: '✅', h: 'बेहतरीन गुणवत्ता' },
                { icon: '🤲', h: 'बरकत और सुकून' },
              ]
            : [
                { icon: '🛡️', h: 'Trusted & Secure' },
                { icon: '🚚', h: 'On Time Delivery' },
                { icon: '✅', h: 'Quality Assured' },
                { icon: '🤲', h: 'Serving with Niyat' },
              ]
          ).map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">{f.icon}</span>
              <p
                className="text-[9.5px] font-bold text-gray-800 leading-tight"
                style={isHindi ? { fontFamily: 'var(--font-devanagari), sans-serif' } : {}}
              >
                {f.h}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Tagline Footer */}
      <div
        className="border-t border-[#d4af37]/25 py-3.5 text-center mt-auto"
        style={{ background: '#0e3d2a' }}
      >
        <p className="text-[9.5px] font-bold tracking-[0.18em] text-[#d4af37]/75">
          {isHindi
            ? '— हर नियाज़ में बरकत, हर तबरुक में मोहब्बत —'
            : '— HAR NIYAZ MEIN BARAKAT, HAR TABARRUK MEIN MOHABBAT —'}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="phone-screen min-h-[100dvh]" style={{ background: '#FAF6F0' }} />
    }>
      <LoginInner />
    </Suspense>
  )
}