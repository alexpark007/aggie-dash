'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'

export default function DriverApplicationForm() {
  const [step, setStep] = useState<'account' | 'details' | 'done'>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [ucdEmail, setUcdEmail] = useState('')
  const [studentId, setStudentId] = useState('')

  const supabase = createClient()

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'driver' } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep('details')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ucdEmail.endsWith('@ucdavis.edu')) {
      setError('Must use a @ucdavis.edu email address')
      return
    }
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Please sign in first'); setLoading(false); return }

    const { error } = await supabase.from('drivers').insert({
      user_id: user.id,
      name,
      ucd_email: ucdEmail,
      student_id: studentId,
      status: 'pending',
    })

    if (error) { setError(error.message); setLoading(false); return }
    setStep('done')
    setLoading(false)
  }

  if (step === 'done') {
    return (
      <Card>
        <CardBody className="text-center py-10">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600">We&apos;ll review your application and contact you at your UCD email within 24 hours.</p>
        </CardBody>
      </Card>
    )
  }

  if (step === 'account') {
    return (
      <Card>
        <CardBody className="space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Step 1: Create your driver account</h2>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <Input label="Personal Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@gmail.com" helpText="Your login email (can be any email)" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" helpText="At least 6 characters" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Continue</Button>
          </form>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Step 2: Student Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
          <Input
            label="UCD Email"
            type="email"
            value={ucdEmail}
            onChange={e => setUcdEmail(e.target.value)}
            required
            placeholder="jdoe@ucdavis.edu"
            helpText="Must end in @ucdavis.edu"
          />
          <Input
            label="Student ID"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            required
            placeholder="999XXXXXX"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Submit Application</Button>
        </form>
      </CardBody>
    </Card>
  )
}
