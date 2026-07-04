'use client'

// Shared delivery-date picker bottom sheet.
// Used on the store menu (to choose the menu's date) and on checkout (so the
// checkout date selector looks and behaves identically to the menu one).
import { Check, X } from 'lucide-react'
import { useLanguage, t } from '@/lib/k14-store'
import { hijriFromIso, type DateOption } from '@/lib/dates'

export default function DateSheet({
  options,
  selected,
  onSelect,
  onClose,
  accent = '#d4af37',
}: {
  options: DateOption[]
  selected: string | null
  onSelect: (iso: string) => void
  onClose: () => void
  accent?: string
}) {
  const { lang } = useLanguage()
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="phone-screen w-full rounded-t-3xl border-t border-gray-100 bg-white p-6 pb-8 animate-in slide-in-from-bottom duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h3 className="font-serif-display text-lg font-bold text-gray-900">{t('Select a date', 'तारीख़ चुनें', lang)}</h3><p className="mt-0.5 text-xs text-gray-500">{t("Choose a delivery date to see that day's menu.", 'उस दिन का मेन्यू देखने के लिए डिलीवरी तारीख़ चुनें।', lang)}</p></div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><X className="size-5" /></button>
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
          {options.map((d) => {
            const active = d.iso === selected
            return (
              <button key={d.iso} onClick={() => onSelect(d.iso)} style={active ? { borderColor: accent, backgroundColor: `${accent}1a` } : undefined} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${active ? '' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-[9px] font-bold tracking-wider" style={{ color: accent }}>{d.month.toUpperCase()}</span>
                    <span className="text-base font-bold leading-none text-gray-900">{d.day}</span>
                  </div>
                  <div><p className="text-sm font-semibold text-gray-900">{d.weekday}</p><p className="text-xs text-gray-500">{d.full}</p>{hijriFromIso(d.iso) && <p className="text-[11px] font-semibold text-[#e23744]">{hijriFromIso(d.iso)}</p>}</div>
                </div>
                {active && <Check className="size-5" style={{ color: accent }} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
