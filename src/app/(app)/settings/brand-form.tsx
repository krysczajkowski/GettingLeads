'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BrandForm({
  initialName,
  initialDescription,
}: {
  initialName: string
  initialDescription: string
}) {
  const [brandName, setBrandName] = useState(initialName)
  const [brandDescription, setBrandDescription] = useState(initialDescription)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        brand_name: brandName.trim(),
        brand_description: brandDescription.trim(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to save brand settings. Please try again.')
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700">
          Brand name
        </label>
        <input
          id="brand-name"
          type="text"
          required
          value={brandName}
          onChange={(e) => { setBrandName(e.target.value); setSaved(false) }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. EquineBoost"
        />
      </div>

      <div>
        <label htmlFor="brand-description" className="block text-sm font-medium text-gray-700">
          Brand description
        </label>
        <textarea
          id="brand-description"
          required
          rows={3}
          value={brandDescription}
          onChange={(e) => { setBrandDescription(e.target.value); setSaved(false) }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Describe your brand and what you sell so the AI can identify relevant leads..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Brand settings saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
