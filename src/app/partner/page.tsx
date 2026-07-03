'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Store, Phone, Tags, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage, t } from '@/lib/k14-store'
import BrandFooter from '@/components/BrandFooter'

const STORE_TYPES_EN = [
  'Bakery',
  'Sweets & Mithai',
  'Mughlai / Restaurant',
  'Kitchenware & Crockery',
  'FMCG / Grocery',
  'Juices & Drinks',
  'Biscuits & Snacks',
  'Other',
]

const STORE_TYPES_HI = [
  'बेकरी',
  'मिठाई',
  'मुगलाई / रेस्टोरेंट',
  'किचन वेयर & क्रॉकरी',
  'FMCG / किराना',
  'जूस & ड्रिंक्स',
  'बिस्किट्स & स्नैक्स',
  'अन्य',
]

export default function PartnerPage() {
  const [storeName, setStoreName] = useState('')
  const [contact, setContact] = useState('')
  const [storeType, setStoreType] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const { lang } = useLanguage()
  const isHindi = lang === 'hi'
  const storeTypes = isHindi ? STORE_TYPES_HI : STORE_TYPES_EN
  const devanagari = isHindi ? { fontFamily: 'var(--font-devanagari), sans-serif' } : {}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = contact.replace(/[^\d]/g, '')
    if (!storeName.trim()) {
      toast.error(t('Please enter your store name', 'कृपया अपनी दुकान का नाम दर्ज करें', lang))
      return
    }
    if (digits.length < 10) {
      toast.error(t('Enter a valid contact number', 'सही संपर्क नंबर दर्ज करें', lang))
      return
    }
    if (!storeType) {
      toast.error(t('Please select a store type', 'कृपया दुकान का प्रकार चुनें', lang))
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('partner_applications').insert({
      store_name: storeName.trim(),
      contact_number: contact.trim(),
      store_type: storeType,
    })
    setLoading(false)

    if (error) {
      toast.error(`${t('Something went wrong', 'कुछ गलत हो गया', lang)}: ${error.message}`)
      return
    }
    setDone(true)
  }

  return (
    <div className="phone-screen min-h-[100dvh] flex flex-col" style={{ background: '#FAF6F0' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden pt-6 pb-14 rounded-b-[44px] shadow-lg flex flex-col items-center text-center px-6"
        style={{ background: 'linear-gradient(180deg, #0e3d2a 0%, #072519 100%)' }}
      >
        <button
          onClick={() => router.push('/login')}
          className="absolute top-5 left-5 z-20 flex items-center justify-center size-9 rounded-full border border-white/20 bg-white/10 text-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="mt-6 mb-2 flex items-center justify-center size-16 rounded-2xl bg-white/10 border border-[#d4af37]/30">
          <Store className="size-8 text-[#d4af37]" />
        </div>
        <h1 className="text-xl font-bold text-white leading-snug" style={devanagari}>
          {t('Become a Partner', 'हमारे पार्टनर बनें', lang)}
        </h1>
        <p className="mt-1.5 text-[12px] text-white/70 max-w-[280px]" style={devanagari}>
          {t(
            'List your store on BookMyTabarruk and reach more customers.',
            'अपनी दुकान को बुकमाईतबरुक पर लिस्ट करें और ज़्यादा ग्राहकों तक पहुँचें।',
            lang,
          )}
        </p>
      </div>

      {/* Card */}
      <div className="-mt-8 mx-5 relative z-10 bg-white rounded-3xl shadow-xl p-6 border border-gray-100/80">
        {done ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="flex items-center justify-center size-16 rounded-full bg-[#0e3d2a]/10 mb-4">
              <CheckCircle className="size-9 text-[#1a5c35]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900" style={devanagari}>
              {t('Application Received!', 'आवेदन प्राप्त हुआ!', lang)}
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed" style={devanagari}>
              {t(
                'Thank you for your interest. Our team will contact you shortly.',
                'आपकी रुचि के लिए धन्यवाद। हमारी टीम जल्द ही आपसे संपर्क करेगी।',
                lang,
              )}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 h-[50px] w-full rounded-2xl text-[15px] font-bold text-white shadow-lg active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(180deg, #1a5c35 0%, #0e3d22 100%)' }}
            >
              <span style={devanagari}>{t('Back to Home', 'होम पर वापस जाएँ', lang)}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store name */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5" style={devanagari}>
                {t('Store Name', 'दुकान का नाम', lang)}
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 focus-within:border-[#0e3d2a] focus-within:ring-2 focus-within:ring-[#0e3d2a]/10 transition-all">
                <Store className="size-4 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={t('e.g. Al-Barkat Bakery', 'जैसे अल-बरकत बेकरी', lang)}
                  className="h-12 w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                  style={devanagari}
                />
              </div>
            </div>

            {/* Contact number */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5" style={devanagari}>
                {t('Contact Number', 'संपर्क नंबर', lang)}
              </label>
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
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t('Mobile number', 'मोबाइल नंबर', lang)}
                    className="h-12 w-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
                    style={devanagari}
                  />
                </div>
              </div>
            </div>

            {/* Store type */}
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5" style={devanagari}>
                {t('Store Type', 'दुकान का प्रकार', lang)}
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-gray-50 px-3.5 focus-within:border-[#0e3d2a] focus-within:ring-2 focus-within:ring-[#0e3d2a]/10 transition-all">
                <Tags className="size-4 shrink-0 text-gray-400" />
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value)}
                  className="h-12 w-full bg-transparent text-[15px] text-gray-900 outline-none"
                  style={{ ...devanagari, color: storeType ? '#111827' : '#9ca3af' }}
                >
                  <option value="" disabled>
                    {t('Select store type', 'दुकान का प्रकार चुनें', lang)}
                  </option>
                  {storeTypes.map((type) => (
                    <option key={type} value={type} className="text-gray-900">
                      {type}
                    </option>
                  ))}
                </select>
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
                  <span style={devanagari}>{t('Submit Application', 'आवेदन जमा करें', lang)}</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="mt-auto" />
      <BrandFooter />
    </div>
  )
}
