import { createHash } from 'node:crypto'

export type ScrapedPost = {
  url: string
  group_url: string
  content_hash: string
  content_length: number
  date_posted: string
  content: string
}

type TriggerResponse = { snapshot_id: string }

const DATASET_ID = 'gd_lz11l67o2cb3r0lkj3'
const BASE_URL = 'https://api.brightdata.com/datasets/v3'
const POLL_INTERVAL_MS = 15_000
const MAX_POLLS = 40

function getApiKey(): string {
  const key = process.env.BRIGHTDATA_API_KEY
  if (!key) throw new Error('Missing BRIGHTDATA_API_KEY')
  return key
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }
}

const FACEBOOK_HOST_RE = /^(www\.)?facebook\.com$/i

export function validateGroupUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && FACEBOOK_HOST_RE.test(parsed.hostname)
  } catch {
    return false
  }
}

export async function triggerScrape(
  groupUrls: string[],
  startDate: string,
): Promise<{ snapshotId: string | null; posts: ScrapedPost[] }> {
  const input = groupUrls.map((url) => ({
    url,
    start_date: startDate,
    end_date: '',
    user_to_not_include: '',
  }))

  const res = await fetch(
    `${BASE_URL}/scrape?dataset_id=${DATASET_ID}&include_errors=true`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ input }),
    },
  )

  if (!res.ok) {
    throw new Error('BrightData trigger failed')
  }

  const data = await res.json()

  if (Array.isArray(data)) {
    return { snapshotId: null, posts: sanitizePosts(data) }
  }

  const { snapshot_id } = data as TriggerResponse
  if (!snapshot_id) {
    throw new Error('BrightData returned neither posts nor snapshot_id')
  }

  return { snapshotId: snapshot_id, posts: [] }
}

export async function pollUntilReady(snapshotId: string): Promise<void> {
  for (let i = 0; i < MAX_POLLS; i++) {
    const res = await fetch(`${BASE_URL}/progress/${snapshotId}`, {
      headers: authHeaders(),
    })

    if (!res.ok) {
      throw new Error('BrightData poll failed')
    }

    const data = (await res.json()) as { status: string }

    if (data.status === 'ready') return
    if (data.status === 'failed') throw new Error('BrightData snapshot failed')
    if (data.status === 'canceled') throw new Error('BrightData snapshot canceled')

    await sleep(POLL_INTERVAL_MS)
  }

  throw new Error(`BrightData polling timed out after ${MAX_POLLS} polls`)
}

export async function downloadSnapshot(
  snapshotId: string,
): Promise<ScrapedPost[]> {
  const res = await fetch(
    `${BASE_URL}/snapshot/${snapshotId}?format=json`,
    { headers: authHeaders() },
  )

  if (!res.ok) {
    throw new Error('BrightData download failed')
  }

  const data = await res.json()
  return sanitizePosts(data as Record<string, unknown>[])
}

function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && FACEBOOK_HOST_RE.test(parsed.hostname)
  } catch {
    return false
  }
}

function sanitizePosts(rawPosts: Record<string, unknown>[]): ScrapedPost[] {
  return rawPosts
    .map((p) => {
      const url = String(p.url ?? '')
      const group_url = String(p.group_url ?? '')
      if (!isFacebookUrl(url) || !isFacebookUrl(group_url)) return null

      const content = String(p.content ?? '')
      return {
        url,
        group_url,
        content_hash: createHash('sha256').update(content).digest('hex'),
        content_length: content.length,
        date_posted: String(p.date_posted ?? ''),
        content,
      }
    })
    .filter((p): p is ScrapedPost => p !== null)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
