import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_TIMEZONES = new Set([
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
])

const WEEKDAY_MAP: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
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

function getLocalWeekday(date: Date, timezone: string): number {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
  }).format(date)
  const day = WEEKDAY_MAP[name]
  if (day === undefined) throw new Error(`Unrecognised weekday: ${name}`)
  return day
}

function computeNextScrapeAt(hour: number, timezone: string, scrapeDays: string): string | null {
  const days = parseDays(scrapeDays)
  if (days.size === 0) return null

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

  for (let i = 0; i < 7; i++) {
    const weekday = getLocalWeekday(candidate, timezone)
    if (days.has(weekday) && candidate.getTime() > now.getTime()) {
      return candidate.toISOString()
    }
    candidate = new Date(candidate.getTime() + 86_400_000)
  }

  return candidate.toISOString()
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { scrape_hour, scrape_timezone, scrape_days } = body as {
    scrape_hour: unknown
    scrape_timezone: unknown
    scrape_days: unknown
  }

  if (typeof scrape_hour !== 'number' || !Number.isInteger(scrape_hour) || scrape_hour < 0 || scrape_hour > 23) {
    return NextResponse.json({ error: 'Invalid hour' }, { status: 400 })
  }

  if (typeof scrape_timezone !== 'string' || !VALID_TIMEZONES.has(scrape_timezone)) {
    return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 })
  }

  if (typeof scrape_days !== 'string' || (scrape_days !== '' && !/^[0-6](,[0-6])*$/.test(scrape_days))) {
    return NextResponse.json({ error: 'Invalid days' }, { status: 400 })
  }

  const nextScrapeAt = computeNextScrapeAt(scrape_hour, scrape_timezone, scrape_days)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      scrape_hour,
      scrape_timezone,
      scrape_days,
      next_scrape_at: nextScrapeAt,
    })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
