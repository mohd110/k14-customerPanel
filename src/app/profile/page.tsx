'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Search, ChevronRight, History, HelpCircle, LogOut, X, Phone, User as UserIcon, Mail } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import BrandFooter from '@/components/BrandFooter'
import { toast } from 'sonner'
import { useLanguage, t } from '@/lib/k14-store'

export default function ProfilePage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orderCount, setOrderCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Edit Profile modal state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  // Support modal
  const [activeModal, setActiveModal] = useState<'support' | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function loadProfile() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Fetch profile row
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      // Fetch dynamic order count
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', currentUser.id)

      const finalProfile = profileData || {
        full_name: currentUser.user_metadata?.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.user_metadata?.phone || currentUser.phone || '',
      }

      setProfile(finalProfile)
      setEditName(finalProfile.full_name || '')
      setEditEmail(finalProfile.email || '')
      setEditPhone(finalProfile.phone || '')
      setOrderCount(count || 0)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t('Logged out successfully', 'सफलतापूर्वक लॉग आउट हो गए', lang))
    router.push('/login')
    router.refresh()
  }

  async function handleSaveProfile(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error(t('Name cannot be empty', 'नाम खाली नहीं हो सकता', lang))
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: 'customer',
          full_name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
        })

      if (error) throw error

      await supabase.auth.updateUser({
        data: { full_name: editName.trim(), phone: editPhone.trim() },
      })

      setProfile((prev: any) => ({
        ...prev,
        full_name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
      }))
      setIsEditing(false)
      toast.success(t('Profile updated successfully!', 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!', lang))
    } catch (err: any) {
      toast.error(err.message || t('Failed to update profile', 'प्रोफ़ाइल अपडेट नहीं हो सकी', lang))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] phone-screen flex flex-col items-center justify-center bg-[#FAF6F0]">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 mt-3 font-semibold">{t('Loading profile...', 'प्रोफ़ाइल लोड हो रही है...', lang)}</p>
      </div>
    )
  }

  const fullName = (profile?.full_name || '').trim()
  const email = (profile?.email || user?.email || '').trim()
  const phone = (profile?.phone || user?.user_metadata?.phone || user?.phone || '').trim()
  const initial = fullName ? fullName.charAt(0).toUpperCase() : ''

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#FAF6F0] text-gray-900 pb-safe relative">
      {/* Header — matches the app's cream/green brand theme */}
      <header className="bg-[#FAF6F0]/90 backdrop-blur-md sticky top-0 z-40 px-5 h-14 flex items-center justify-between border-b border-gray-200/70">
        <div className="flex items-center gap-2.5">
          <img src="/new-logo.jpeg" alt="BMT" className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d4af37]/50" />
          <span className="font-serif-display font-bold text-sm text-[#0e3d2a]">Book<span className="text-[#d4af37]">My</span>Tabarruk</span>
        </div>
        <button onClick={() => router.push('/search')} aria-label="Search" className="p-1 cursor-pointer">
          <Search className="size-5 text-[#0e3d2a]" />
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto pb-24">

        {/* ── Green/gold banner with identity ── */}
        <div className="px-5 pt-5">
          <div
            className="relative overflow-hidden rounded-3xl p-5 shadow-lg"
            style={{ background: 'linear-gradient(180deg, #0e3d2a 0%, #072519 100%)' }}
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#d4af37]/20 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 shrink-0 rounded-full bg-white/10 border-2 border-[#d4af37]/60 flex items-center justify-center select-none">
                {initial ? (
                  <span className="text-2xl font-extrabold text-[#d4af37]">{initial}</span>
                ) : (
                  <UserIcon className="size-7 text-[#d4af37]/70" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold text-white truncate">
                  {fullName || t('Complete your profile', 'अपनी प्रोफ़ाइल पूरी करें', lang)}
                </p>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {phone || email || t('Add your name & contact', 'नाम और संपर्क जोड़ें', lang)}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-1.5 text-[11px] font-bold text-[#d4af37] active:scale-95 transition-transform"
              >
                {t('Edit', 'संपादित', lang)}
              </button>
            </div>
          </div>
        </div>

        {/* ── Account section ── */}
        <div className="px-5 pt-6">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e3d2a]/50">
            {t('Account', 'खाता', lang)}
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50 divide-y divide-gray-100">
            {[
              { label: t('Edit Profile', 'प्रोफ़ाइल संपादित करें', lang), icon: UserIcon, color: 'bg-[#0e3d2a]/8 text-[#0e3d2a]', onClick: () => setIsEditing(true) },
              { label: t('Saved Addresses', 'सहेजे गए पते', lang), icon: MapPin, color: 'bg-[#0e3d2a]/8 text-[#0e3d2a]', onClick: () => router.push('/location') },
              { label: t('Your Orders', 'आपके ऑर्डर', lang), icon: History, color: 'bg-[#d4af37]/12 text-[#b8952a]', badge: orderCount, onClick: () => router.push('/orders') },
            ].map((row, i) => {
              const Icon = row.icon
              return (
                <button key={i} onClick={row.onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${row.color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <span className="flex-1 text-xs font-bold text-gray-800">{row.label}</span>
                  {row.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1.5 text-[10px] font-bold text-[#1a1206]">{row.badge}</span>
                  ) : null}
                  <ChevronRight className="size-4 text-gray-400" />
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Support section ── */}
        <div className="px-5 pt-5">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e3d2a]/50">
            {t('Support', 'सहायता', lang)}
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50 divide-y divide-gray-100">
            <button onClick={() => setActiveModal('support')} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0e3d2a]/8 text-[#0e3d2a]">
                <HelpCircle className="size-4.5" />
              </div>
              <span className="flex-1 text-xs font-bold text-gray-800">{t('Help & Support', 'सहायता', lang)}</span>
              <ChevronRight className="size-4 text-gray-400" />
            </button>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50/60 active:bg-red-50 transition-colors">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <LogOut className="size-4.5" />
              </div>
              <span className="flex-1 text-xs font-bold text-red-500">{t('Logout', 'लॉग आउट', lang)}</span>
              <ChevronRight className="size-4 text-gray-400" />
            </button>
          </div>
          <p className="mt-4 text-center text-[10px] text-gray-400 font-semibold tracking-wide">
            BookMyTabarruk
          </p>
        </div>

        <BrandFooter />
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center transition-all duration-300">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-8 max-w-[430px] border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900">{t('Edit Profile', 'प्रोफ़ाइल संपादित करें', lang)}</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="size-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('Full Name', 'पूरा नाम', lang)}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#b8952a]" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#0e3d2a] focus:ring-2 focus:ring-[#0e3d2a]/10 text-gray-900 placeholder:text-gray-400 transition-all"
                    placeholder={t('Enter your name', 'अपना नाम दर्ज करें', lang)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('Email', 'ईमेल', lang)}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#b8952a]" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#0e3d2a] focus:ring-2 focus:ring-[#0e3d2a]/10 text-gray-900 placeholder:text-gray-400 transition-all"
                    placeholder={t('Enter your email', 'अपना ईमेल दर्ज करें', lang)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t('Phone Number', 'फ़ोन नंबर', lang)}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#b8952a]" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#0e3d2a] focus:ring-2 focus:ring-[#0e3d2a]/10 text-gray-900 placeholder:text-gray-400 transition-all"
                    placeholder={t('Enter phone number', 'फ़ोन नंबर दर्ज करें', lang)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-11 bg-gradient-to-b from-[#1a5c35] to-[#0e3d22] text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('Saving changes...', 'सहेजा जा रहा है...', lang)}
                    </>
                  ) : (
                    t('Save Changes', 'बदलाव सहेजें', lang)
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Help & Support Modal ── */}
      {activeModal === 'support' && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center transition-all duration-300">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-8 max-w-[430px] border-t border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900">{t('Help & Support', 'सहायता', lang)}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="size-5 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              {t('Need help with an order? Reach out to the BookMyTabarruk kitchen and the team will assist you.', 'ऑर्डर में मदद चाहिए? BookMyTabarruk रसोई से संपर्क करें, टीम आपकी सहायता करेगी।', lang)}
            </p>
            <a
              href="tel:+919335774525"
              className="w-full h-12 bg-[#0e3d2a]/8 hover:bg-[#0e3d2a]/12 text-[#0e3d2a] text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-[#0e3d2a]/20"
            >
              <Phone className="size-4" /> +91 93357 74525
            </a>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
