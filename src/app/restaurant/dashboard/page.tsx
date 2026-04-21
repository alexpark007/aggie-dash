import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import OrderStatusUpdater from '@/components/restaurant/OrderStatusUpdater'

export const dynamic = 'force-dynamic'

export default async function RestaurantDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/restaurant/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) redirect('/restaurant/onboarding')

  if (!restaurant.is_active) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-600">
          Your restaurant application is pending admin approval. We'll notify you once it's approved.
        </p>
      </div>
    )
  }

  // Today's orders
  const today = new Date().toISOString().split('T')[0]
  const { data: todayOrders } = await supabase
    .from('orders')
    .select(`*, items:order_items(*, menu_item:menu_items(name))`)
    .eq('restaurant_id', restaurant.id)
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })

  const activeOrders = (todayOrders ?? []).filter(o =>
    ['placed', 'preparing', 'ready_for_pickup'].includes(o.status)
  )

  const todayRevenue = (todayOrders ?? [])
    .filter(o => o.status === 'delivered')
    .reduce((sum: number, o: { total: number }) => sum + o.total, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm">{restaurant.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${restaurant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {restaurant.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#002855]">{activeOrders.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active Orders</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#C99700]">{formatCurrency(todayRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Today&apos;s Revenue</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-gray-700">{(todayOrders ?? []).length}</p>
            <p className="text-sm text-gray-500 mt-1">Today&apos;s Orders</p>
          </CardBody>
        </Card>
      </div>

      {/* Active orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Incoming Orders</h2>
            <Link href="/restaurant/orders" className="text-sm text-[#002855] hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {activeOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-3xl mb-2">🎉</p>
              <p>No active orders right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeOrders.map((order: {
                id: string
                created_at: string
                status: string
                total: number
                delivery_address: string
                items: Array<{ menu_item: { name: string } | null; quantity: number }>
              }) => (
                <div key={order.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {order.items?.map((i: { menu_item: { name: string } | null; quantity: number }) =>
                          `${i.quantity}× ${i.menu_item?.name}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">→ {order.delivery_address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <OrderStatusUpdater order={order} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
