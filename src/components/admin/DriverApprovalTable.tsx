'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Driver } from '@/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'

interface Props {
  drivers: Driver[]
  defaultHourlyRate: number
}

export default function DriverApprovalTable({ drivers: initialDrivers, defaultHourlyRate }: Props) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [loading, setLoading] = useState<string | null>(null)
  const [shiftDriver, setShiftDriver] = useState<Driver | null>(null)
  const [shiftDate, setShiftDate] = useState('')
  const [shiftStart, setShiftStart] = useState('09:00')
  const [shiftEnd, setShiftEnd] = useState('17:00')
  const [hourlyRate, setHourlyRate] = useState(defaultHourlyRate.toString())
  const [shiftLoading, setShiftLoading] = useState(false)
  const [shiftError, setShiftError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleStatus = async (driver: Driver, status: 'approved' | 'rejected') => {
    setLoading(driver.id)
    await supabase.from('drivers').update({ status }).eq('id', driver.id)
    setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status } : d))
    setLoading(null)
    router.refresh()
  }

  const handleScheduleShift = async () => {
    if (!shiftDriver || !shiftDate) return
    setShiftLoading(true)
    setShiftError(null)
    const { error } = await supabase.from('shifts').insert({
      driver_id: shiftDriver.id,
      date: shiftDate,
      start_time: shiftStart,
      end_time: shiftEnd,
      hourly_rate: parseFloat(hourlyRate) || defaultHourlyRate,
    })
    if (error) { setShiftError(error.message); setShiftLoading(false); return }
    setShiftDriver(null)
    setShiftLoading(false)
    router.refresh()
  }

  const statusVariant = (status: string) => {
    if (status === 'approved') return 'success'
    if (status === 'rejected') return 'danger'
    if (status === 'pending') return 'warning'
    return 'default'
  }

  const pending = drivers.filter(d => d.status === 'pending')
  const others = drivers.filter(d => d.status !== 'pending')

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
            <h2 className="font-bold text-amber-900">Pending Applications ({pending.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 text-gray-500">UCD Email</th>
                  <th className="text-left px-6 py-3 text-gray-500">Student ID</th>
                  <th className="px-6 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map(driver => (
                  <tr key={driver.id}>
                    <td className="px-6 py-3 font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-3 text-gray-600">{driver.ucd_email}</td>
                    <td className="px-6 py-3 text-gray-600 font-mono">{driver.student_id}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleStatus(driver, 'approved')}
                          loading={loading === driver.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatus(driver, 'rejected')}
                          loading={loading === driver.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Drivers ({others.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500">Name</th>
                <th className="text-left px-6 py-3 text-gray-500">UCD Email</th>
                <th className="text-left px-6 py-3 text-gray-500">Status</th>
                <th className="px-6 py-3 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {others.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No drivers yet.</td></tr>
              ) : (
                others.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-3 text-gray-600">{driver.ucd_email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant(driver.status)}>{driver.status}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2 justify-center">
                        {driver.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setShiftDriver(driver); setShiftDate('') }}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Schedule Shift
                          </Button>
                        )}
                        {driver.status === 'rejected' && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatus(driver, 'approved')}>
                            Re-approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule shift modal */}
      <Modal isOpen={!!shiftDriver} onClose={() => setShiftDriver(null)} title={`Schedule Shift — ${shiftDriver?.name}`}>
        <div className="space-y-4">
          <Input label="Date" type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
            <Input label="End Time" type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
          </div>
          <Input
            label="Hourly Rate ($)"
            type="number"
            step="0.25"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
          />
          {shiftError && <p className="text-red-600 text-sm">{shiftError}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShiftDriver(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleScheduleShift} loading={shiftLoading} disabled={!shiftDate} className="flex-1">
              Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
