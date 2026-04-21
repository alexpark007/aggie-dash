export const dynamic = 'force-dynamic'

import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 min-w-0 p-6">{children}</main>
    </div>
  )
}
