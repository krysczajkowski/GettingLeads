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
        className="rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Subscribe'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
