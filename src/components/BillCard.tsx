'use client'

import { money } from '@/lib/format'
import { useLanguage, t } from '@/lib/k14-store'
import type { Order } from '@/lib/types'

// Customer bill: same header stack as the KOT (BMT / house mark / store) plus
// item prices and the paid (40% advance) / unpaid (balance) split.
export default function BillCard({
  order,
  storeName,
}: {
  order: Order
  storeName?: string | null
}) {
  const { lang } = useLanguage()
  const items = order.order_items ?? []
  const total = order.total || 0
  const paid = order.advance_amount ?? Math.round(total * 0.4)
  const balance = Math.max(0, total - paid)
  const code = order.order_code || `#${order.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 text-white">
      {/* header stack */}
      <div className="border-b border-dashed border-neutral-700 pb-3 text-center">
        <p className="text-lg font-black tracking-[0.2em] text-[#d4af37]">BMT</p>
        <p className="text-[9px] uppercase tracking-wider text-neutral-400">
          k14 epicurian delight foods
        </p>
        {storeName && (
          <p className="mt-1 text-sm font-extrabold uppercase tracking-wide text-white">
            {storeName}
          </p>
        )}
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          {t('Bill', 'बिल', lang)}
        </p>
      </div>

      {/* order ref */}
      <div className="flex items-center justify-between py-2 text-[11px] font-semibold text-neutral-300">
        <span className="text-neutral-500">{t('Order', 'ऑर्डर', lang)}</span>
        <span className="font-mono text-white">{code}</span>
      </div>

      {/* items */}
      <div className="divide-y divide-neutral-800 border-y border-neutral-800">
        {items.length === 0 ? (
          <p className="py-2 text-xs text-neutral-500">{t('No items', 'कोई वस्तु नहीं', lang)}</p>
        ) : (
          items.map((it, i) => {
            const qty = it.quantity ?? 1
            const price = it.price_at_order ?? 0
            return (
              <div key={i} className="flex items-center justify-between gap-2 py-2 text-xs">
                <span className="min-w-0 flex-1 truncate text-neutral-200">
                  <span className="font-bold text-[#d4af37]">{qty}×</span> {it.products?.name || 'Item'}
                </span>
                <span className="shrink-0 font-semibold text-white">{money(price * qty)}</span>
              </div>
            )
          })
        )}
      </div>

      {/* totals + paid/unpaid split */}
      <div className="space-y-1.5 pt-3 text-xs">
        <div className="flex items-center justify-between text-neutral-300">
          <span>{t('Total', 'कुल', lang)}</span>
          <span className="font-bold text-white">{money(total)}</span>
        </div>
        <div className="flex items-center justify-between text-green-400">
          <span>{t('Paid (40% advance)', 'भुगतान किया (40% अग्रिम)', lang)}</span>
          <span className="font-bold">{money(paid)}</span>
        </div>
        <div className="flex items-center justify-between text-[#e23744]">
          <span>{t('Balance due', 'शेष राशि', lang)}</span>
          <span className="font-bold">{money(balance)}</span>
        </div>
      </div>
    </div>
  )
}
