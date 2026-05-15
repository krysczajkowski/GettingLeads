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
    setTimeout(() => setSaved(false), 1500)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="brand-name" className="text-[13.5px] font-medium text-ink-700">
          Brand name
        </label>
        <input
          id="brand-name"
          type="text"
          required
          value={brandName}
          onChange={(e) => { setBrandName(e.target.value); setSaved(false) }}
          className="w-full rounded-[10px] border border-line-2 bg-white px-3 py-2.5 text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
          placeholder="e.g. EquineBoost"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="brand-description" className="text-[13.5px] font-medium text-ink-700">
          Brand description
        </label>
        <textarea
          id="brand-description"
          required
          rows={3}
          value={brandDescription}
          onChange={(e) => { setBrandDescription(e.target.value); setSaved(false) }}
          className="w-full resize-y rounded-[10px] border border-line-2 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
          placeholder="e.g. We sell 3PL services to ecommerce founders shipping out of the US..."
        />
        <span className="text-[12px] text-ink-500">One paragraph is plenty — be specific about who, what, and the moment they need you.</span>
      </div>

      {error && <p className="text-[13px] text-danger-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className={`inline-flex items-center gap-2 rounded-[10px] px-[18px] py-2.5 text-[14px] font-medium text-fg-on-brand transition-all duration-[200ms] disabled:cursor-not-allowed disabled:opacity-50 ${
          saved
            ? 'bg-brand-press'
            : 'bg-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_8px_16px_-2px_rgba(21,179,108,0.45)] active:translate-y-0 active:scale-[0.985]'
        }`}
      >
        {saved ? (
          <>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
            Saved
          </>
        ) : saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
