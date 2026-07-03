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
    <div className="min-h-[100dvh] phone-screen flex flex-col bg-[#FAF6F0]">
      <header className="bg-[#FAF6F0]/90 backdrop-blur-md sticky top-0 z-40 px-5 h-14 flex items-center gap-3 border-b border-gray-200/70">
        <BackButton iconClassName="size-6 text-[#0e3d2a]" />
        <h1 className="text-base font-bold text-[#0e3d2a]"><Txt en="My Orders" hi="मेरे ऑर्डर" /></h1>
      </header>
      <main className="flex-1 px-4 pt-4 pb-24">
        <OrdersClient initialOrders={orders} userId={user.id} />
        <BrandFooter />
      </main>
      <BottomNav />
    </div>
  )
}
