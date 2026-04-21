'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  restaurantId: string
  initialItems: MenuItem[]
}

const BLANK_ITEM = {
  name: '',
  description: '',
  price: '',
  category: 'General',
  image_url: '',
  is_available: true,
}

export default function MenuBuilder({ restaurantId, initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(BLANK_ITEM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const openNew = () => {
    setEditing(null)
    setForm(BLANK_ITEM)
    setError(null)
    setShowModal(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url ?? '',
      is_available: item.is_available,
    })
    setError(null)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) { setError('Invalid price'); return }
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      category: form.category.trim() || 'General',
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
    }

    if (editing) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editing.id)
      if (error) { setError(error.message); setLoading(false); return }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i))
    } else {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ ...payload, restaurant_id: restaurantId })
        .select()
        .single()
      if (error || !data) { setError(error?.message ?? 'Failed to add item'); setLoading(false); return }
      setItems(prev => [...prev, data])
    }

    setShowModal(false)
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    await supabase.from('menu_items').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
    router.refresh()
  }

  const toggleAvailability = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-medium">No menu items yet</p>
          <p className="text-sm">Click "Add Item" to build your menu.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat}>
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">{cat}</h2>
            <div className="space-y-2">
              {catItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 bg-white border rounded-xl px-4 py-3 ${
                    item.is_available ? 'border-gray-200' : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.description && <p className="text-sm text-gray-500 truncate">{item.description}</p>}
                  </div>
                  <p className="font-bold text-gray-900 shrink-0">{formatCurrency(item.price)}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                      title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                    >
                      {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Item Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Pepperoni Pizza" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Describe the dish..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              required
              placeholder="12.99"
            />
            <Input
              label="Category"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              required
              placeholder="Pizza, Sides, Drinks..."
            />
          </div>
          <Input
            label="Image URL (optional)"
            value={form.image_url}
            onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
            placeholder="https://..."
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.is_available}
              onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))}
              className="accent-[#002855]"
            />
            <label htmlFor="available" className="text-sm text-gray-700">Available for ordering</label>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">
              {editing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
