import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MenuPage from '@/components/customer/MenuPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RestaurantMenuPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!restaurant) notFound()

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', id)
    .eq('is_available', true)
    .order('category')
    .order('name')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <MenuPage restaurant={restaurant} menuItems={menuItems ?? []} />
      </main>
      <Footer />
    </div>
  )
}
