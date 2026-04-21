import DriverPortalNav from '@/components/driver/PortalNav'

export default function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DriverPortalNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
