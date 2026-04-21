import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import OrderStatusUpdater from '@/components/restaurant/OrderStatusUpdater'
import RestaurantOrdersRealtime from '@/components/restaurant/OrdersRealtime'

export const dynamic = 'force-dynamic'

export default async function RestaurantOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/restaurant/login')

  const { data: restaurant } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single()
  if (!restaurant) redirect('/restaurant/onboarding')

  const { data: orders } = await supabase
    .from('orders')
    .select(`*, items:order_items(*, menu_item:menu_items(name))`)
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <RestaurantOrdersRealtime restaurantId={restaurant.id} />
      </div>

      <Card>
        <CardBody className="p-0">
          {!orders?.length ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-3xl mb-2">📋</p>
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order: {
                id: string
                created_at: string
                status: string
                total: number
                subtotal: number
                delivery_fee: number
                tip: number
                delivery_address: string
                special_instructions: string | null
                items: Array<{ menu_item: { name: string } | null; quantity: number; price: number }>
              }) => (
                <div key={order.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{formatDate(order.created_at)}</p>
                      <div className="text-sm text-gray-700 space-y-0.5">
                        {order.items?.map((i, idx) => (
                          <span key={idx}>{idx > 0 ? ', ' : ''}{i.quantity}× {i.menu_item?.name}</span>
                        ))}
                      </div>
                      {order.special_instructions && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
                          Note: {order.special_instructions}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">→ {order.delivery_address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500">Subtotal: {formatCurrency(order.subtotal)} + tip: {formatCurrency(order.tip)}</p>
                      {['placed', 'preparing'].includes(order.status) && (
                        <OrderStatusUpdater order={order} />
                      )}
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
