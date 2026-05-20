'use client'

import { useState } from 'react'

export default function ExportData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/account/export')

      if (!res.ok) {
        setError('Failed to export data. Please try again.')
        setLoading(false)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ?? 'gettingleads-data.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export data. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div>
      <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">
        Download a JSON file with all your data: profile, groups, leads, usage, and scrape history.
      </p>

      {error && <p className="mb-3 text-[13px] text-danger-500">{error}</p>}

      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-[10px] border border-line-2 bg-white px-[18px] py-2.5 text-[14px] font-medium text-ink-1000 transition-all duration-[200ms] hover:-translate-y-px hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(0,0,0,0.08)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        {loading ? 'Downloading...' : 'Download my data'}
      </button>
    </div>
  )
}
