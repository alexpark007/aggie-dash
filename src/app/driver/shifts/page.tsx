import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/Card'
import { Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DriverShiftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/driver/login')

  const { data: driver } = await supabase.from('drivers').select('id, status').eq('user_id', user.id).single()
  if (!driver || driver.status !== 'approved') redirect('/driver/dashboard')

  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('driver_id', driver.id)
    .order('date', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  const upcoming = (shifts ?? []).filter(s => s.date >= today)
  const past = (shifts ?? []).filter(s => s.date < today)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Shifts</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming shifts scheduled yet.</p>
            <p className="text-xs mt-1">Admin will schedule you based on your availability.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(shift => (
              <ShiftCard key={shift.id} shift={shift} type="upcoming" />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Past Shifts</h2>
          <div className="space-y-2">
            {past.slice(0, 10).map(shift => (
              <ShiftCard key={shift.id} shift={shift} type="past" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ShiftCard({ shift, type }: {
  shift: { id: string; date: string; start_time: string; end_time: string | null; hourly_rate: number }
  type: 'upcoming' | 'past'
}) {
  const hoursWorked = shift.end_time
    ? (() => {
        const [sh, sm] = shift.start_time.split(':').map(Number)
        const [eh, em] = shift.end_time.split(':').map(Number)
        return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
      })()
    : null

  const earned = hoursWorked !== null ? hoursWorked * shift.hourly_rate : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">
          {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-sm text-gray-500">
          {shift.start_time} – {shift.end_time ?? 'In Progress'}
          {hoursWorked !== null && ` (${hoursWorked.toFixed(1)} hrs)`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[#002855]">{formatCurrency(shift.hourly_rate)}/hr</p>
        {earned !== null && (
          <p className="text-sm text-green-600 font-medium">{formatCurrency(earned)} earned</p>
        )}
        {type === 'upcoming' && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Scheduled</span>
        )}
      </div>
    </div>
  )
}
