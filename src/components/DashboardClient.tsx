'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Order, OrderStatus, PaymentStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import OrderStatusBadge from './OrderStatusBadge'
import { toast } from 'sonner'
import { MapPin, Phone } from 'lucide-react'
import { orderNumber } from '@/lib/format'

const paymentBadge: Record<PaymentStatus, { label: string; cls: string }> = {
  awaiting_verification: { label: 'Advance: unverified', cls: 'bg-yellow-500/15 text-yellow-400' },
  paid:                  { label: 'Advance: paid',       cls: 'bg-green-500/15 text-green-400' },
  failed:                { label: 'Advance: rejected',   cls: 'bg-red-500/15 text-red-400' },
}

const TRANSITIONS: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending:          { next: 'accepted',        label: 'Accept Order'    },
  accepted:         { next: 'preparing',       label: 'Start Preparing' },
  preparing:        { next: 'out_for_delivery', label: 'Mark Ready'     },
  ready:            { next: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { next: 'delivered',       label: 'Mark Delivered'  },
  delivered:        null,
  cancelled:        null,
}

const statusBg: Record<OrderStatus, string> = {
  pending:          'border-l-gray-300',
  accepted:         'border-l-blue-500',
  preparing:        'border-l-yellow-500',
  ready:            'border-l-yellow-400',
  out_for_delivery: 'border-l-orange-500',
  delivered:        'border-l-green-500',
  cancelled:        'border-l-red-400',
}

interface Props {
  initialOrders: Order[]
}

export default function DashboardClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('restaurant-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload: RealtimePostgresChangesPayload<Order>) => {
          const newRow = payload.new as Order
          const { data } = await supabase
            .from('orders')
            .select(
              '*, order_items(quantity, price_at_order, products(name)), profiles(full_name, phone)'
            )
            .eq('id', newRow.id)
            .single()
          if (data) {
            setOrders((prev) => [data as Order, ...prev])
            toast.success('New order received!')
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          const updated = payload.new as Order
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function advanceStatus(orderId: string, next: OrderStatus) {
    setUpdating(orderId)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: next })
      .eq('id', orderId)
    if (error) toast.error('Failed to update order status')
    setUpdating(null)
  }

  async function setPayment(orderId: string, payment_status: PaymentStatus) {
    setUpdating(orderId)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', orderId)
    if (error) toast.error('Failed to update payment status')
    else toast.success(payment_status === 'paid' ? 'Advance marked as paid' : 'Advance rejected')
    setUpdating(null)
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🍳</span>
        <p className="font-medium text-white mb-1">No orders yet</p>
        <p className="text-sm text-muted-foreground">Waiting for customers to place orders</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const transition = TRANSITIONS[order.status as OrderStatus]
        const borderClass = statusBg[order.status as OrderStatus] ?? 'border-l-gray-300'
        const address = (order as any).delivery_address
        const payStatus = (order.payment_status ?? 'awaiting_verification') as PaymentStatus
        const pay = paymentBadge[payStatus] ?? paymentBadge.awaiting_verification

        return (
          <div key={order.id} className={`bg-neutral-900 rounded-2xl shadow-sm border-l-4 ${borderClass} overflow-hidden`}>
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex justify-between items-start mb-1">
                <p className="font-mono font-semibold text-sm text-white break-all">
                  {orderNumber(order)}
                </p>
                <span className="font-bold text-orange-600">₹{order.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>
            </div>

            {/* Items */}
            <div className="px-4 pb-3 space-y-0.5">
              {(address as any)?.items ? (
                ((address as any).items as any[]).map((item, i) => (
                  <p key={i} className="text-sm text-neutral-200 font-semibold">
                    {item.name}{' '}
                    <span className="text-muted-foreground font-normal">× {item.quantity}</span>
                  </p>
                ))
              ) : (
                (order.order_items as any[])?.map((item, i) => (
                  <p key={i} className="text-sm text-neutral-200">
                    {item.products?.name}{' '}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </p>
                ))
              )}
            </div>

            {/* Customer info */}
            {((order as any).profiles?.full_name || address?.address) && (
              <div className="px-4 pb-3 space-y-1">
                {(order as any).profiles?.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" />
                    {(order as any).profiles.full_name} · {(order as any).profiles.phone}
                  </p>
                )}
                {address?.alt_phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" />
                    Alt: {address.alt_phone}
                  </p>
                )}
                {address?.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    {address.address}, {address.pincode}
                  </p>
                )}
              </div>
            )}

            {/* Advance payment */}
            <div className="px-4 pb-3">
              <div className="rounded-xl bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Advance (40%): <span className="font-semibold text-white">₹{order.advance_amount ?? 0}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pay.cls}`}
                  >
                    {pay.label}
                  </span>
                </div>
                {order.payment_ref && (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    UTR: {order.payment_ref}
                  </p>
                )}
                {payStatus === 'awaiting_verification' && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      className="h-9 flex-1 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold"
                      onClick={() => setPayment(order.id, 'paid')}
                      disabled={updating === order.id}
                    >
                      Verify Paid
                    </Button>
                    <Button
                      className="h-9 flex-1 bg-red-600/80 hover:bg-red-700 rounded-lg text-xs font-semibold"
                      onClick={() => setPayment(order.id, 'failed')}
                      disabled={updating === order.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="px-4 pb-4">
              {transition ? (
                <Button
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 rounded-xl font-semibold"
                  onClick={() => advanceStatus(order.id, transition.next)}
                  disabled={updating === order.id}
                >
                  {updating === order.id ? 'Updating…' : transition.label}
                </Button>
              ) : (
                <div className="h-11 flex items-center justify-center bg-[#10241a] rounded-xl">
                  <span className="text-sm font-semibold text-green-400">✓ Ready for pickup</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}