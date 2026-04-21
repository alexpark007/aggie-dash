export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { ChevronRight } from 'lucide-react'

export default async function OrderHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account/orders')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const orders = customer
    ? (await supabase
        .from('orders')
        .select(`*, restaurant:restaurants(name)`)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
      ).data ?? []
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🛵</p>
            <p className="font-medium">No orders yet!</p>
            <Link href="/" className="text-[#002855] text-sm hover:underline mt-2 inline-block">
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: {
              id: string
              created_at: string
              status: string
              restaurant: { name: string } | null
              total: number
            }) => (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 hover:border-[#C99700] transition-colors group"
              >
                <div>
                  <p className="font-semibold text-gray-900">{order.restaurant?.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#002855] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
