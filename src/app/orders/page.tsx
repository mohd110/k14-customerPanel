import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersClient from '@/components/OrdersClient'
import BottomNav from '@/components/BottomNav'
import { Order } from '@/lib/types'
import BackButton from '@/components/BackButton'
import BrandFooter from '@/components/BrandFooter'
import Txt from '@/components/Txt'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, price))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as Order[]

  return (
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#0a0a0a]">
      <header className="bg-neutral-900 sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-[#2a2a2a]/20">
        <BackButton />
        <h1 className="text-base font-bold text-[#e23744]"><Txt en="My Orders" hi="मेरे ऑर्डर" /></h1>
      </header>
      <main className="flex-1 px-4 pt-4 pb-24">
        <OrdersClient initialOrders={orders} userId={user.id} />
        <BrandFooter />
      </main>
      <BottomNav />
    </div>
  )
}
