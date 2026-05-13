export type ScrapeFrequency = 'daily' | 'every_12h' | 'every_6h'

const INTERVAL_HOURS: Record<ScrapeFrequency, number> = {
  daily: 24,
  every_12h: 12,
  every_6h: 6,
}

export type ScrapeMessage = {
  userId: string
  brandName: string | null
  brandDescription: string | null
  retentionDays: number
  groups: { url: string }[]
  scrapeHour: number
  scrapeTimezone: string
  scrapeFrequency: ScrapeFrequency
}

export function computeNextScrapeAt(
  hour: number,
  timezone: string,
  frequency: ScrapeFrequency,
  after: Date = new Date(),
): Date {
  const intervalMs = INTERVAL_HOURS[frequency] * 3_600_000

  let candidate = localHourToUtc(after, hour, timezone)

  // If candidate is in the past or right now, walk forward by interval
  while (candidate.getTime() <= after.getTime()) {
    candidate = new Date(candidate.getTime() + intervalMs)
  }

  return candidate
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

  // Build "today at `hour`:00" as a fake UTC timestamp
  const fakeUtc = Date.UTC(localYear, localMonth - 1, localDay, hour, 0, 0)

  // Find the actual UTC offset (including fractional hours like UTC+5:30)
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
