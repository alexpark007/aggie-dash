import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin-login')

  const [
    { count: totalOrders },
    { count: activeRestaurants },
    { count: pendingDrivers },
    { count: activeDrivers },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('orders').select('total').eq('status', 'delivered'),
  ])

  const totalRevenue = (revenueData ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, total,
      restaurant:restaurants(name),
      customer:customers(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Total Platform Revenue', value: formatCurrency(totalRevenue), color: 'text-green-600' },
    { label: 'Active Restaurants', value: activeRestaurants ?? 0, color: 'text-[#002855]' },
    { label: 'Total Orders', value: totalOrders ?? 0, color: 'text-[#C99700]' },
    { label: 'Active Drivers', value: activeDrivers ?? 0, color: 'text-purple-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        {(pendingDrivers ?? 0) > 0 && (
          <a href="/admin/drivers" className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors">
            ⚠️ {pendingDrivers} driver applications pending
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <Card key={label}>
            <CardBody className="text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Restaurant</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(recentOrders ?? []).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-3 text-gray-900">{order.restaurant?.name}</td>
                  <td className="px-6 py-3 text-gray-700">{order.customer?.name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
