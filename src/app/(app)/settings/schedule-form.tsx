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
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="scrape-frequency" className="block text-sm font-medium text-gray-700">
          Frequency
        </label>
        <select
          id="scrape-frequency"
          value={frequency}
          onChange={(e) => { setFrequency(e.target.value as Frequency); setSaved(false) }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="scrape-hour" className="block text-sm font-medium text-gray-700">
          Start time
        </label>
        <select
          id="scrape-hour"
          value={hour}
          onChange={(e) => { setHour(parseInt(e.target.value)); setSaved(false) }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {formatHour(i)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="scrape-timezone" className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <select
          id="scrape-timezone"
          value={timezone}
          onChange={(e) => { setTimezone(e.target.value); setSaved(false) }}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Schedule saved.</p>}

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
