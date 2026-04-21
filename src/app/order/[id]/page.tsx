import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OrderTracker from '@/components/customer/OrderTracker'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      restaurant:restaurants(name, address, cuisine),
      items:order_items(*, menu_item:menu_items(name, price))
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <OrderTracker order={order} />
      </main>
      <Footer />
    </div>
  )
}
