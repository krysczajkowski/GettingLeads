'use client'

import { useState } from 'react'

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()

    if (res.ok && data.url) {
      window.location.href = data.url
      return
    }

    setError(data.error ?? 'Something went wrong. Please try again.')
    setLoading(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-6 py-3 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_8px_16px_-2px_rgba(21,179,108,0.45)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Subscribe'}
      </button>
      {error && <p className="mt-2 text-[13px] text-danger-500">{error}</p>}
    </div>
  )
}
