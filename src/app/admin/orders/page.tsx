import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin-login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, subtotal, delivery_fee, tip, total, delivery_address,
      restaurant:restaurants(name),
      customer:customers(name),
      driver:drivers(name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500">ID</th>
                <th className="text-left px-4 py-3 text-gray-500">Date</th>
                <th className="text-left px-4 py-3 text-gray-500">Restaurant</th>
                <th className="text-left px-4 py-3 text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-gray-500">Driver</th>
                <th className="text-left px-4 py-3 text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(orders ?? []).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-gray-900">{order.restaurant?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{order.customer?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{order.driver?.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
