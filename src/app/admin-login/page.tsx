export const dynamic = 'force-dynamic'

import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#002855] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-[#C99700] font-bold text-2xl">Davis</span>
            <span className="font-bold text-2xl text-[#002855]">Delivers</span>
          </div>
          <p className="text-gray-500 text-sm">Admin Portal</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
