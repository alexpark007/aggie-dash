import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminRestaurantsClient from '@/components/admin/RestaurantsClient'

export const dynamic = 'force-dynamic'

export default async function AdminRestaurantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin-login')

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurants</h1>
      <AdminRestaurantsClient restaurants={restaurants ?? []} />
    </div>
  )
}
