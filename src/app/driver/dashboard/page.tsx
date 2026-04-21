import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

export const dynamic = 'force-dynamic'

export default async function DriverDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/driver/login')

  const { data: driver } = await supabase.from('drivers').select('*').eq('user_id', user.id).single()

  if (!driver) redirect('/driver/apply')

  if (driver.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
        <p className="text-gray-600">We&apos;re reviewing your application and will let you know at <strong>{driver.ucd_email}</strong>.</p>
      </div>
    )
  }

  if (driver.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
        <p className="text-gray-600">Unfortunately, your application was not approved. Contact us at hello@davisdelivers.com for more info.</p>
      </div>
    )
  }

  // Upcoming shifts
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .gte('date', today)
    .order('date')
    .limit(5)

  // Current active shift (today, started)
  const { data: activeShift } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .eq('date', today)
    .is('end_time', null)
    .single()

  // Active deliveries
  const { data: activeDeliveries } = activeShift
    ? await supabase
        .from('deliveries')
        .select(`*, order:orders(*, restaurant:restaurants(name, address))`)
        .eq('driver_id', driver.id)
        .eq('shift_id', activeShift.id)
        .is('delivered_at', null)
    : { data: null }

  // Earnings this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: recentShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .gte('date', weekAgo.toISOString().split('T')[0])
    .not('end_time', 'is', null)

  const weekEarnings = (recentShifts ?? []).reduce((sum, shift) => {
    if (!shift.end_time) return sum
    const [sh, sm] = shift.start_time.split(':').map(Number)
    const [eh, em] = shift.end_time.split(':').map(Number)
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60
    return sum + Math.max(0, hours) * shift.hourly_rate
  }, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hi, {driver.name}! 👋</h1>
        <p className="text-gray-500 text-sm">UCD Student Driver</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#C99700]">{formatCurrency(weekEarnings)}</p>
            <p className="text-sm text-gray-500 mt-1">This Week</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-[#002855]">{(upcomingShifts ?? []).length}</p>
            <p className="text-sm text-gray-500 mt-1">Upcoming Shifts</p>
          </CardBody>
        </Card>
      </div>

      {/* Active shift */}
      {activeShift && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Shift in Progress</p>
              <p className="text-sm text-green-700">
                Started at {activeShift.start_time} · {formatCurrency(activeShift.hourly_rate)}/hr
              </p>
            </div>
            <Link href="/driver/deliveries">
              <Button size="sm" variant="secondary">View Deliveries</Button>
            </Link>
          </div>
          {activeDeliveries && activeDeliveries.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-sm text-green-700 font-medium">{activeDeliveries.length} active delivery</p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming shifts */}
      <Card>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Upcoming Shifts</h2>
          <Link href="/driver/shifts" className="text-sm text-[#002855] hover:underline">View all</Link>
        </div>
        <CardBody className="p-0">
          {!upcomingShifts?.length ? (
            <div className="text-center py-8 text-gray-500 text-sm">No upcoming shifts. Check back soon!</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingShifts.map(shift => (
                <div key={shift.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">{shift.start_time} – {shift.end_time ?? 'TBD'}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#002855]">{formatCurrency(shift.hourly_rate)}/hr</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
