'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Search, ChevronRight, History, HelpCircle, LogOut, X, Phone, User as UserIcon, Mail } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
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

      // No mock fallbacks — only show what the account actually has.
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
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  async function handleSaveProfile(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
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

      // Sync name/phone to auth metadata (email stays on the profile row to
      // avoid triggering a confirmation flow for phone-login accounts).
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
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] phone-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-4 border-[#e23744] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 mt-3 font-semibold">Loading profile...</p>
      </div>
    )
  }

  // Real values only — empty string means "not provided yet".
  const fullName = (profile?.full_name || '').trim()
  const email = (profile?.email || user?.email || '').trim()
  const phone = (profile?.phone || user?.user_metadata?.phone || user?.phone || '').trim()
  const initial = fullName ? fullName.charAt(0).toUpperCase() : ''

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#0a0a0a] text-white pb-safe relative">
      {/* Header */}
      <header className="bg-neutral-900 sticky top-0 z-40 px-4 h-14 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2 text-[#e23744]">
          <MapPin className="size-5" />
          <span className="font-extrabold text-sm text-neutral-100">K14 Bakers</span>
        </div>
        <button className="p-1 cursor-pointer">
          <Search className="size-5 text-neutral-200" />
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto pb-24">

        {/* Profile Card Info */}
        <div className="flex flex-col items-center pt-6 pb-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center shadow-md border-2 border-neutral-700 select-none">
              {initial ? (
                <span className="text-4xl font-extrabold text-[#e23744]">{initial}</span>
              ) : (
                <UserIcon className="size-10 text-neutral-500" />
              )}
            </div>
            {/* Edit pencil badge */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#e23744] text-white flex items-center justify-center shadow-md cursor-pointer border-2 border-[#0a0a0a] hover:bg-[#c52d39] transition-colors"
            >
              <svg className="size-3.5 fill-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.127 22.564l-5.127 1.436 1.436-5.127 12.192-12.192 3.691 3.691-12.192 12.192zm14.288-14.288l-2.485-2.485 1.586-1.586 2.485 2.485-1.586 1.586z"/>
              </svg>
            </button>
          </div>

          {/* Name */}
          {fullName ? (
            <h2 className="text-lg font-extrabold text-white mt-4 leading-tight">{fullName}</h2>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-sm font-bold text-[#e23744] hover:underline"
            >
              + Add your name
            </button>
          )}

          {/* Email */}
          {email ? (
            <p className="text-xs text-neutral-400 font-medium mt-1">{email}</p>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-neutral-500 font-medium mt-1 hover:text-neutral-300"
            >
              + Add your email
            </button>
          )}

          {/* Phone */}
          {phone ? (
            <div className="mt-2.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide text-[#e23744] bg-[#1c1c1c]">
              {phone}
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide text-neutral-400 bg-[#1c1c1c] hover:text-neutral-200"
            >
              + Add your phone
            </button>
          )}
        </div>

        {/* Orders stat (real) */}
        <div className="px-4 mb-5">
          <div className="bg-neutral-900 rounded-2xl p-4 text-center border border-neutral-800/50 flex flex-col justify-center">
            <span className="text-2xl font-extrabold text-[#e23744]">{orderCount}</span>
            <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5">
              {orderCount === 1 ? 'Order' : 'Orders'}
            </span>
          </div>
        </div>

        {/* Options List */}
        <div className="px-4 space-y-2.5 mb-6">
          {[
            { label: 'Saved Addresses', icon: MapPin, color: 'bg-[#2a1416] text-[#e23744] border-[#3a1f22]/20', href: '/location' },
            { label: 'Order History', icon: History, color: 'bg-[#2a2410] text-amber-600 border-[#3a3420]/20', href: '/orders' },
            { label: 'Help & Support', icon: HelpCircle, color: 'bg-cyan-50 text-cyan-600 border-cyan-100/20', onClick: () => setActiveModal('support') },
            { label: 'Logout', icon: LogOut, color: 'bg-[#2a1416] text-[#e23744] border-[#3a1f22]/20', onClick: handleLogout },
          ].map((opt, i) => {
            const Icon = opt.icon
            return (
              <div
                key={i}
                onClick={() => {
                  if (opt.onClick) opt.onClick()
                  else if (opt.href && opt.href !== '#') router.push(opt.href)
                }}
                className="bg-neutral-900 rounded-2xl p-3 flex items-center justify-between border border-neutral-800/50 cursor-pointer hover:bg-neutral-800/40 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${opt.color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200">{opt.label}</span>
                </div>
                <ChevronRight className="size-4 text-neutral-400" />
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center transition-all duration-300">
          <div className="bg-neutral-900 w-full rounded-t-3xl p-6 pb-8 max-w-[430px] border-t border-neutral-800 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="size-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#e23744] transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#e23744] transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#e23744] transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-11 bg-[#e23744] text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#c52d39] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Help & Support Modal ── */}
      {activeModal === 'support' && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center transition-all duration-300">
          <div className="bg-neutral-900 w-full rounded-t-3xl p-6 pb-8 max-w-[430px] border-t border-neutral-800 flex flex-col gap-4 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Help & Support</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="size-5 text-neutral-400" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
              Need help with an order? Reach out to the K14 kitchen and the team
              will assist you.
            </p>
            <button
              onClick={() => toast.info('Support contact coming soon')}
              className="w-full h-11 bg-[#1c1c1c] hover:bg-[#2a1416] text-[#e23744] text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
