import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuBuilder from '@/components/restaurant/MenuBuilder'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/restaurant/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) redirect('/restaurant/onboarding')

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('category')
    .order('name')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Builder</h1>
      <MenuBuilder restaurantId={restaurant.id} initialItems={menuItems ?? []} />
    </div>
  )
}
