import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import DashboardClient from '@/components/DashboardClient'
import { Order } from '@/lib/types'

export default async function DashboardPage() {
  // MOCK DASHBOARD FOR DESIGN VERIFICATION
  const orders: Order[] = [
    {
      id: 'mock-1',
      customer_id: 'user-1',
      status: 'pending',
      total: 15.99,
      advance_amount: 6,
      payment_status: 'awaiting_verification',
      payment_ref: '416312345678',
      payment_proof_url: null,
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
          order_id: 'mock-1',
          product_id: 'prod-1',
          quantity: 2,
          price_at_order: 5.0,
          products: { name: 'Test Burger', price: 5.0 }
        }
      ],
      profiles: {
        full_name: 'Test Customer',
        phone: '123-456-7890'
      }
    }
  ]

  return (
    <div className="min-h-[100dvh] bg-neutral-900">
      <NavBar role="restaurant" />
      <main className="phone-screen px-4 pt-4 pb-8">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">Live Orders</h1>
          <p className="text-sm text-muted-foreground">New orders appear automatically</p>
        </div>
        <DashboardClient initialOrders={orders} />
      </main>
    </div>
  )
}