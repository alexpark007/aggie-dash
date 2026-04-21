import RestaurantPortalNav from '@/components/restaurant/PortalNav'

export default function RestaurantPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <RestaurantPortalNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
