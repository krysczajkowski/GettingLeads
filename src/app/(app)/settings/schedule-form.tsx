'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Warsaw',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
]

function formatHour(h: number): string {
  if (h === 0) return '12:00 AM'
  if (h === 12) return '12:00 PM'
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`
}

function parseDays(scrapeDays: string): Set<number> {
  if (!scrapeDays || scrapeDays.trim() === '') return new Set()
  const set = new Set<number>()
  for (const part of scrapeDays.split(',')) {
    const n = parseInt(part, 10)
    if (n >= 0 && n <= 6) set.add(n)
  }
  return set
}

const selectClasses = "w-full appearance-none rounded-[10px] border border-line-2 bg-white bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235A6360' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")] bg-[right_12px_center] bg-no-repeat px-3 py-2.5 pr-[38px] text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] focus:border-brand focus:shadow-focus"

export default function ScheduleForm({
  initialHour,
  initialTimezone,
  initialDays,
  onSuccessHref,
}: {
  initialHour: number
  initialTimezone: string
  initialDays: string
  onSuccessHref?: string
}) {
  const [days, setDays] = useState<Set<number>>(() => parseDays(initialDays))
  const [hour, setHour] = useState(initialHour)
  const [timezone, setTimezone] = useState(initialTimezone)
  const [showTzPicker, setShowTzPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (initialTimezone !== 'UTC') return
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (TIMEZONES.includes(detected)) {
      setTimezone(detected)
    }
  }, [initialTimezone])

  function toggleDay(day: number) {
    setDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) {
        next.delete(day)
      } else {
        next.add(day)
      }
      return next
    })
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)

    const daysStr = [...days].sort((a, b) => a - b).join(',')

    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scrape_hour: hour,
        scrape_timezone: timezone,
        scrape_days: daysStr,
      }),
    })

    if (!res.ok) {
      setError('Failed to save schedule. Please try again.')
      setSaving(false)
      return
    }

    if (onSuccessHref) {
      router.push(onSuccessHref)
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
        <label className="text-[13.5px] font-medium text-ink-700">Days</label>
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              aria-label={DAY_NAMES[i]}
              aria-pressed={days.has(i)}
              onClick={() => toggleDay(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-[120ms] ${
                days.has(i)
                  ? 'bg-brand text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_2px_6px_-1px_rgba(21,179,108,0.35)]'
                  : 'border border-line-2 bg-surface-2 text-ink-600 hover:border-line-3 hover:bg-surface-3'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {days.size === 0 && (
          <p className="text-[13px] text-ink-500">Scraping is paused. Select at least one day to resume.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scrape-hour" className="text-[13.5px] font-medium text-ink-700">
            Time
          </label>
          <select
            id="scrape-hour"
            value={hour}
            onChange={(e) => { setHour(parseInt(e.target.value)); setSaved(false) }}
            className={selectClasses}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {formatHour(i)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13.5px] font-medium text-ink-700">Timezone</label>
          {showTzPicker ? (
            <select
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); setShowTzPicker(false); setSaved(false) }}
              className={selectClasses}
              autoFocus
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          ) : (
            <p className="flex h-[42px] items-center text-[14px] text-ink-1000">
              {timezone.replace(/_/g, ' ')}
              <button
                type="button"
                onClick={() => setShowTzPicker(true)}
                className="ml-2 text-[13px] text-brand hover:underline"
              >
                Change
              </button>
            </p>
          )}
        </div>
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
