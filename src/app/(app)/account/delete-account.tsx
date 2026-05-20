'use client'

import { useState } from 'react'

const CONFIRMATION = 'delete my account'

export default function DeleteAccount() {
  const [input, setInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmed = input.toLowerCase().trim() === CONFIRMATION

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmed) return

    setError(null)
    setDeleting(true)

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })

      if (!res.ok) {
        setError('Failed to delete account. Please try again.')
        setDeleting(false)
        return
      }

      await fetch('/api/auth/signout', { method: 'POST' })
      window.location.href = '/login'
    } catch {
      setError('Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div>
      <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      <form onSubmit={handleDelete} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="delete-confirm" className="text-[13.5px] font-medium text-ink-700">
            Type <span className="font-mono text-danger-700">{CONFIRMATION}</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={deleting}
            autoComplete="off"
            className="w-full rounded-[10px] border border-line-2 bg-white px-3 py-2.5 text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-danger-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)] disabled:opacity-50"
            placeholder={CONFIRMATION}
          />
        </div>

        {error && <p className="text-[13px] text-danger-500">{error}</p>}

        <button
          type="submit"
          disabled={!confirmed || deleting}
          className="inline-flex items-center gap-2 rounded-[10px] bg-danger-600 px-[18px] py-2.5 text-[14px] font-medium text-white transition-all duration-[200ms] hover:bg-danger-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete my account'}
        </button>
      </form>
    </div>
  )
}
