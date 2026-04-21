export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthForm mode="login" />
      </main>
    </div>
  )
}
