export type ScrapeMessage = {
  userId: string
  brandName: string | null
  offer: string | null
  targetPosts: string | null
  retentionDays: number
  groups: { url: string }[]
  scrapeHour: number
  scrapeTimezone: string
  scrapeDays: string
}

const WEEKDAY_MAP: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

export function parseDays(scrapeDays: string): Set<number> {
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

function localHourToUtc(reference: Date, hour: number, timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(reference)

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value)

  const localYear = get('year')
  const localMonth = get('month')
  const localDay = get('day')

  const fakeUtc = Date.UTC(localYear, localMonth - 1, localDay, hour, 0, 0)

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

  return new Date(fakeUtc - offsetMs)
}

export function computeNextScrapeAt(
  hour: number,
  timezone: string,
  scrapeDays: string,
  after: Date = new Date(),
): Date | null {
  const days = parseDays(scrapeDays)
  if (days.size === 0) return null

  let candidate = localHourToUtc(after, hour, timezone)

  for (let i = 0; i < 7; i++) {
    const weekday = getLocalWeekday(candidate, timezone)
    if (days.has(weekday) && candidate.getTime() > after.getTime()) {
      return candidate
    }
    candidate = new Date(candidate.getTime() + 86_400_000)
  }

  return candidate
}
