'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Order, OrderStatus } from '@/lib/types'
import Link from 'next/link'
import { CheckCircle, ChefHat, Bike, Package, Clock, ArrowRight, ThumbsUp } from 'lucide-react'
import { orderNumber } from '@/lib/format'
import { useLanguage, t } from '@/lib/k14-store'

interface Props {
  initialOrders: Order[]
  userId: string
}

const STATUS_STEPS: { status: OrderStatus; label: string; hi: string; icon: React.ElementType }[] = [
  { status: 'pending', label: 'Received', hi: 'प्राप्त', icon: Package },
  { status: 'accepted', label: 'Accepted', hi: 'स्वीकृत', icon: ThumbsUp },
  { status: 'preparing', label: 'Preparing', hi: 'बन रहा', icon: ChefHat },
  { status: 'out_for_delivery', label: 'On the Way', hi: 'रास्ते में', icon: Bike },
  { status: 'delivered', label: 'Arrived', hi: 'पहुँच गया', icon: CheckCircle },
]

function statusIndex(status: OrderStatus) {
  // 'ready' isn't its own step — treat it as still "preparing".
  if (status === 'ready') return STATUS_STEPS.findIndex((s) => s.status === 'preparing')
  return STATUS_STEPS.findIndex((s) => s.status === status)
}

function OrderStepper({ status, lang }: { status: OrderStatus; lang: 'en' | 'hi' }) {
  const current = statusIndex(status)
  return (
    <div className="flex items-center justify-between mt-3 mb-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current
        const active = i === current
        const Icon = step.icon
        return (
          <div key={step.status} className="flex-1 flex flex-col items-center relative">
            {i < STATUS_STEPS.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < current ? 'bg-[#0e3d2a]' : 'bg-gray-200'}`} />
            )}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
              done ? 'bg-[#0e3d2a] border-[#0e3d2a]' : 'bg-white border-gray-200'
            }`}>
              <Icon className={`size-3.5 ${done ? 'text-white' : 'text-gray-400'}`} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold mt-1 text-center leading-tight ${done ? 'text-[#0e3d2a]' : 'text-gray-400'}`}>
              {lang === 'hi' ? step.hi : step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function statusLabel(status: OrderStatus, lang: 'en' | 'hi') {
  const map: Record<OrderStatus, [string, string]> = {
    pending: ['Order Received', 'ऑर्डर प्राप्त'],
    accepted: ['Accepted', 'स्वीकृत'],
    preparing: ['Being Prepared', 'बनाया जा रहा है'],
    ready: ['Ready', 'तैयार'],
    out_for_delivery: ['On the Way', 'रास्ते में'],
    delivered: ['Delivered', 'डिलीवर हो गया'],
    cancelled: ['Cancelled', 'रद्द'],
  }
  const pair = map[status]
  return pair ? t(pair[0], pair[1], lang) : status
}

export default function OrdersClient({ initialOrders, userId }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const { lang } = useLanguage()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('customer-orders')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `customer_id=eq.${userId}`,
      }, (payload: RealtimePostgresChangesPayload<Order>) => {
        const updated = payload.new as Order
        setOrders((prev) =>
          prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o)
        )
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">📋</span>
        <p className="font-bold text-gray-900 mb-1">{t('No orders yet', 'अभी कोई ऑर्डर नहीं', lang)}</p>
        <p className="text-sm text-gray-500 mb-6">{t('Your order history will appear here', 'आपका ऑर्डर इतिहास यहाँ दिखेगा', lang)}</p>
        <Link
          href="/stores"
          className="h-12 px-8 bg-gradient-to-b from-[#1a5c35] to-[#0e3d22] text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          {t('Browse Stores', 'दुकानें देखें', lang)} <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isCancelled = order.status === 'cancelled'
        return (
          <div key={order.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm shadow-gray-200/50">
            {/* Header */}
            <div className="px-4 pt-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 font-mono break-all">{orderNumber(order)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCancelled ? 'bg-red-50 text-red-500' :
                order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                'bg-[#d4af37]/12 text-[#b8952a]'
              }`}>
                {statusLabel(order.status as OrderStatus, lang)}
              </span>
            </div>

            {/* Stepper */}
            {!isCancelled && (
              <div className="px-4 pb-2">
                <OrderStepper status={order.status as OrderStatus} lang={lang} />
              </div>
            )}

            {/* Items */}
            <div className="px-4 pb-3 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-1.5">
                {((order.delivery_address as any)?.items)
                  ? ((order.delivery_address as any).items as { name: string; quantity: number }[])
                      .map((item) => `${item.name} ×${item.quantity}`)
                      .join(', ')
                  : (order.order_items as { quantity: number; products?: { name: string } }[])
                      ?.map((item) => `${item.products?.name} ×${item.quantity}`)
                      .join(', ')}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500">{t('Total', 'कुल', lang)}</span>
                <span className="font-bold text-[#0e3d2a] text-sm">₹{order.total}</span>
              </div>
            </div>
          </div>
        )
      })}

      <div className="pt-2 pb-4 text-center">
        <Link
          href="/stores"
          className="h-11 px-6 border-2 border-[#0e3d2a] text-[#0e3d2a] font-semibold rounded-xl inline-flex items-center gap-1 active:scale-95 transition-transform"
        >
          {t('Order Again', 'फिर ऑर्डर करें', lang)} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}