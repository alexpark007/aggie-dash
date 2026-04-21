import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DriverDeliveriesClient from '@/components/driver/DeliveriesClient'

export const dynamic = 'force-dynamic'

export default async function DriverDeliveriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/driver/login')

  const { data: driver } = await supabase.from('drivers').select('id, status').eq('user_id', user.id).single()
  if (!driver || driver.status !== 'approved') redirect('/driver/dashboard')

  const today = new Date().toISOString().split('T')[0]

  const { data: activeShift } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .eq('date', today)
    .single()

  if (!activeShift) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">📅</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Shift Today</h2>
        <p className="text-gray-600">You don&apos;t have a shift scheduled for today. Check your shifts tab for upcoming dates.</p>
      </div>
    )
  }

  const { data: deliveries } = await supabase
    .from('deliveries')
    .select(`
      *,
      order:orders(
        id, status, delivery_address, total, special_instructions,
        restaurant:restaurants(name, address),
        items:order_items(quantity, menu_item:menu_items(name))
      )
    `)
    .eq('driver_id', driver.id)
    .eq('shift_id', activeShift.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Today&apos;s Deliveries</h1>
      <p className="text-gray-500 text-sm mb-6">Shift: {activeShift.start_time} – {activeShift.end_time ?? 'In Progress'}</p>
      <DriverDeliveriesClient
        deliveries={deliveries ?? []}
        driverId={driver.id}
        shiftId={activeShift.id}
      />
    </div>
  )
}
