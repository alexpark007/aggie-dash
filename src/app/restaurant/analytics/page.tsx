import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function RestaurantAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/restaurant/login')

  const { data: restaurant } = await supabase.from('restaurants').select('id, name').eq('user_id', user.id).single()
  if (!restaurant) redirect('/restaurant/onboarding')

  // Last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: orders } = await supabase
    .from('orders')
    .select(`*, items:order_items(*, menu_item:menu_items(name, price))`)
    .eq('restaurant_id', restaurant.id)
    .eq('status', 'delivered')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const allOrders = orders ?? []

  const totalRevenue = allOrders.reduce((sum: number, o: { subtotal: number }) => sum + o.subtotal, 0)
  const totalOrders = allOrders.length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Popular items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  allOrders.forEach((order: { items?: Array<{ menu_item: { name: string } | null; quantity: number; price: number }> }) => {
    order.items?.forEach((item) => {
      const name = item.menu_item?.name ?? 'Unknown'
      if (!itemCounts[name]) itemCounts[name] = { name, count: 0, revenue: 0 }
      itemCounts[name].count += item.quantity
      itemCounts[name].revenue += item.price * item.quantity
    })
  })
  const popularItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 10)

  // Daily breakdown
  const dailyMap: Record<string, number> = {}
  allOrders.forEach((order: { created_at: string; subtotal: number }) => {
    const day = order.created_at.split('T')[0]
    dailyMap[day] = (dailyMap[day] ?? 0) + order.subtotal
  })
  const daily = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Last 7 days · Delivered orders only</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#002855]">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Revenue</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#C99700]">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-1">Orders</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-gray-700">{formatCurrency(avgOrder)}</p>
            <p className="text-sm text-gray-500 mt-1">Avg Order</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily revenue */}
        <Card>
          <CardHeader><h2 className="font-bold text-gray-900">Daily Revenue</h2></CardHeader>
          <CardBody className="space-y-3">
            {daily.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No data yet.</p>
            ) : (
              daily.map(([date, revenue]) => {
                const max = Math.max(...daily.map(([, v]) => v))
                const pct = max > 0 ? (revenue / max) * 100 : 0
                return (
                  <div key={date}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="font-medium">{formatCurrency(revenue)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#002855] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardBody>
        </Card>

        {/* Popular items */}
        <Card>
          <CardHeader><h2 className="font-bold text-gray-900">Popular Items</h2></CardHeader>
          <CardBody className="space-y-2">
            {popularItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No data yet.</p>
            ) : (
              popularItems.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-5">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.count} sold · {formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
