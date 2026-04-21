import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import DriverApprovalTable from '@/components/admin/DriverApprovalTable'
import ShiftScheduler from '@/components/admin/ShiftScheduler'

export const dynamic = 'force-dynamic'

export default async function AdminDriversPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin-login')

  const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: settings } = await supabase.from('platform_settings').select('driver_hourly_rate').single()

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Drivers</h1>
      <DriverApprovalTable
        drivers={drivers ?? []}
        defaultHourlyRate={settings?.driver_hourly_rate ?? 18}
      />
    </div>
  )
}
