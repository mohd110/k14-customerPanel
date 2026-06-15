import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersClient from '@/components/OrdersClient'
import BottomNav from '@/components/BottomNav'
import { Order } from '@/lib/types'
import BackButton from '@/components/BackButton'

export default async function OrdersPage() {
  // MOCK ORDERS FOR DESIGN VERIFICATION
  const orders: Order[] = [
    {
      id: 'mock-order-1',
      customer_id: 'user-1',
      status: 'pending',
      total: 15.99,
      delivery_address: {
        name: 'Test Customer',
        phone: '123-456-7890',
        address: '123 Test St',
        pincode: '123456'
      },
      created_at: new Date().toISOString(),
      order_items: [
        {
          id: 'item-1',
          order_id: 'mock-order-1',
          product_id: 'prod-1',
          quantity: 2,
          price_at_order: 5.0,
          products: { name: 'Test Burger', price: 5.0 }
        }
      ]
    }
  ]

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#0a0a0a]">
      <header className="bg-neutral-900 sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-[#2a2a2a]/20">
        <BackButton />
        <h1 className="text-base font-bold text-[#e23744]">My Orders</h1>
      </header>
      <main className="flex-1 px-4 pt-4 pb-24">
        <OrdersClient initialOrders={orders} userId="user-1" />
      </main>
      <BottomNav />
    </div>
  )
}