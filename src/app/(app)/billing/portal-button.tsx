'use client'

import { useState } from 'react'

export default function PortalButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePortal() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/portal', { method: 'POST' })
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
        onClick={handlePortal}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Manage Subscription'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
