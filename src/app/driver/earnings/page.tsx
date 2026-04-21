import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/Card'
import { DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DriverEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/driver/login')

  const { data: driver } = await supabase.from('drivers').select('id, status, name').eq('user_id', user.id).single()
  if (!driver || driver.status !== 'approved') redirect('/driver/dashboard')

  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .not('end_time', 'is', null)
    .order('date', { ascending: false })

  const shiftsWithEarnings = (shifts ?? []).map(shift => {
    const [sh, sm] = shift.start_time.split(':').map(Number)
    const [eh, em] = (shift.end_time ?? '00:00').split(':').map(Number)
    const hours = Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
    return { ...shift, hours, earned: hours * shift.hourly_rate }
  })

  const totalEarned = shiftsWithEarnings.reduce((sum, s) => sum + s.earned, 0)
  const totalHours = shiftsWithEarnings.reduce((sum, s) => sum + s.hours, 0)

  // Current month
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const monthShifts = shiftsWithEarnings.filter(s => s.date >= monthStart)
  const monthEarned = monthShifts.reduce((sum, s) => sum + s.earned, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-[#C99700]">{formatCurrency(monthEarned)}</p>
            <p className="text-xs text-gray-500 mt-1">This Month</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-[#002855]">{formatCurrency(totalEarned)}</p>
            <p className="text-xs text-gray-500 mt-1">All Time</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center p-4">
            <p className="text-2xl font-bold text-gray-700">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Hours</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Shift History</h2>
        </div>
        <CardBody className="p-0">
          {shiftsWithEarnings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No completed shifts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {shiftsWithEarnings.map(shift => (
                <div key={shift.id} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shift.start_time} – {shift.end_time} ({shift.hours.toFixed(1)} hrs @ {formatCurrency(shift.hourly_rate)}/hr)
                    </p>
                  </div>
                  <p className="font-bold text-green-600">{formatCurrency(shift.earned)}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
