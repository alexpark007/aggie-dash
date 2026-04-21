'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'

interface Props {
  mode: 'login' | 'signup'
  role?: 'customer' | 'restaurant' | 'driver'
  redirectTo?: string
}

export default function AuthForm({ mode, role = 'customer', redirectTo }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = redirectTo ?? searchParams.get('redirect') ?? '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email to confirm your account!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push(redirect)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardBody className="space-y-5">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-[#C99700] font-bold text-2xl">Davis</span>
            <span className="font-bold text-2xl text-[#002855]">Delivers</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm text-center">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              helpText={mode === 'signup' ? 'Minimum 6 characters' : undefined}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#002855] font-semibold hover:underline">Sign up</Link>
            </>
          ) : (
            <>Already have an account?{' '}
              <Link href="/auth/login" className="text-[#002855] font-semibold hover:underline">Sign in</Link>
            </>
          )}
        </p>
      </CardBody>
    </Card>
  )
}
