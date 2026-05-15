'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Frequency = 'daily' | 'every_12h' | 'every_6h'

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Once a day' },
  { value: 'every_12h', label: 'Twice a day (every 12h)' },
  { value: 'every_6h', label: 'Four times a day (every 6h)' },
]

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

function computeNextScrapeAt(hour: number, timezone: string, frequency: Frequency): string {
  const intervalHours = frequency === 'daily' ? 24 : frequency === 'every_12h' ? 12 : 6
  const intervalMs = intervalHours * 3_600_000
  const now = new Date()

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value)
  const localYear = get('year')
  const localMonth = get('month')
  const localDay = get('day')

  const noon = new Date(Date.UTC(localYear, localMonth - 1, localDay, 12, 0, 0))
  const noonParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(noon)
  const noonH = parseInt(noonParts.find((p) => p.type === 'hour')!.value)
  const noonM = parseInt(noonParts.find((p) => p.type === 'minute')!.value)
  const offsetMs = (noonH - 12) * 3_600_000 + noonM * 60_000

  const fakeUtc = Date.UTC(localYear, localMonth - 1, localDay, hour, 0, 0)
  let candidate = new Date(fakeUtc - offsetMs)

  while (candidate.getTime() <= now.getTime()) {
    candidate = new Date(candidate.getTime() + intervalMs)
  }

  return candidate.toISOString()
}

const selectClasses = "w-full appearance-none rounded-[10px] border border-line-2 bg-white bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235A6360' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")] bg-[right_12px_center] bg-no-repeat px-3 py-2.5 pr-[38px] text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] focus:border-brand focus:shadow-focus"

export default function ScheduleForm({
  initialHour,
  initialTimezone,
  initialFrequency,
}: {
  initialHour: number
  initialTimezone: string
  initialFrequency: string
}) {
  const [hour, setHour] = useState(initialHour)
  const [timezone, setTimezone] = useState(initialTimezone)
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency as Frequency)
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

    const nextScrapeAt = computeNextScrapeAt(hour, timezone, frequency)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        scrape_hour: hour,
        scrape_timezone: timezone,
        scrape_frequency: frequency,
        next_scrape_at: nextScrapeAt,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to save schedule. Please try again.')
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
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scrape-frequency" className="text-[13.5px] font-medium text-ink-700">
            Frequency
          </label>
          <select
            id="scrape-frequency"
            value={frequency}
            onChange={(e) => { setFrequency(e.target.value as Frequency); setSaved(false) }}
            className={selectClasses}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="scrape-hour" className="text-[13.5px] font-medium text-ink-700">
            Start time
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
          <label htmlFor="scrape-timezone" className="text-[13.5px] font-medium text-ink-700">
            Timezone
          </label>
          <select
            id="scrape-timezone"
            value={timezone}
            onChange={(e) => { setTimezone(e.target.value); setSaved(false) }}
            className={selectClasses}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
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
