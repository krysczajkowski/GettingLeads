import { SupabaseClient } from '@supabase/supabase-js'
import {
  ScrapedPost,
  triggerScrape,
  pollUntilReady,
  downloadSnapshot,
  validateGroupUrl,
} from './brightdata'
import { classifyPost, rateLimitDelay } from './classifier'

const MONTHLY_POST_LIMIT = 5_000
const TRIAL_POST_CAP = 200
const MIN_CONTENT_LENGTH = 10

export type UserWithGroups = {
  userId: string
  brandName: string | null
  offer: string | null
  targetPosts: string | null
  retentionDays: number
  subscriptionStatus: string
  trialPostsUsed: number
  trialEndsAt: string | null
  groups: { url: string }[]
}

export type PipelineResult = {
  userId: string
  status: 'skipped_usage' | 'success' | 'error'
  postsFetched: number
  postsFiltered: number
  postsClassified: number
  leadsFound: number
  errorCode?: string
}

type PostForClassification = {
  url: string
  group_url: string
  content_hash: string
  content: string
}

const ERROR_CODES: Record<string, string> = {
  'BrightData trigger failed': 'BRIGHTDATA_TRIGGER_FAILED',
  'BrightData poll failed': 'BRIGHTDATA_POLL_FAILED',
  'BrightData snapshot failed': 'BRIGHTDATA_SNAPSHOT_FAILED',
  'BrightData snapshot canceled': 'BRIGHTDATA_SNAPSHOT_CANCELED',
  'BrightData polling timed out': 'BRIGHTDATA_POLL_TIMEOUT',
  'BrightData download failed': 'BRIGHTDATA_DOWNLOAD_FAILED',
  'BrightData returned neither': 'BRIGHTDATA_INVALID_RESPONSE',
  'Failed to create scrape log': 'DB_SCRAPE_LOG_CREATE_FAILED',
  'Failed to update scrape log': 'DB_SCRAPE_LOG_UPDATE_FAILED',
  'Failed to increment usage': 'DB_USAGE_UPDATE_FAILED',
  'Failed to fetch profiles': 'DB_PROFILES_FETCH_FAILED',
  'Failed to fetch groups': 'DB_GROUPS_FETCH_FAILED',
  'Failed to insert lead': 'DB_LEAD_INSERT_FAILED',
  'Missing OPENAI_API_KEY': 'OPENAI_KEY_MISSING',
}

function toErrorCode(err: unknown): string {
  if (!(err instanceof Error)) return 'UNKNOWN_ERROR'
  const msg = err.message
  for (const [prefix, code] of Object.entries(ERROR_CODES)) {
    if (msg.startsWith(prefix)) return code
  }
  return 'UNKNOWN_ERROR'
}

export async function processUser(
  supabase: SupabaseClient,
  user: UserWithGroups,
): Promise<PipelineResult> {
  const { userId, groups, brandName, offer, targetPosts, retentionDays } = user
  const currentMonth = new Date().toISOString().slice(0, 7)

  if (user.subscriptionStatus === 'trialing') {
    const trialExpired = !user.trialEndsAt || new Date(user.trialEndsAt) < new Date()
    if (trialExpired) {
      await supabase.from('profiles').update({ subscription_status: 'inactive' }).eq('id', userId).eq('subscription_status', 'trialing')
      return { userId, status: 'skipped_usage', postsFetched: 0, postsFiltered: 0, postsClassified: 0, leadsFound: 0 }
    }
    if (user.trialPostsUsed >= TRIAL_POST_CAP) {
      return { userId, status: 'skipped_usage', postsFetched: 0, postsFiltered: 0, postsClassified: 0, leadsFound: 0 }
    }
  }

  const postsUsed = await getUsage(supabase, userId, currentMonth)
  if (postsUsed >= MONTHLY_POST_LIMIT) {
    return { userId, status: 'skipped_usage', postsFetched: 0, postsFiltered: 0, postsClassified: 0, leadsFound: 0 }
  }

  const trialRemaining = user.subscriptionStatus === 'trialing'
    ? TRIAL_POST_CAP - user.trialPostsUsed
    : Infinity
  const remaining = Math.min(MONTHLY_POST_LIMIT - postsUsed, trialRemaining)

  const validGroups = groups.filter((g) => validateGroupUrl(g.url))
  if (validGroups.length === 0) {
    return { userId, status: 'success', postsFetched: 0, postsFiltered: 0, postsClassified: 0, leadsFound: 0 }
  }

  const logId = await createScrapeLog(supabase, userId, validGroups.length)

  try {
    const yesterday = getYesterday()
    const groupUrls = validGroups.map((g) => g.url)
    const { snapshotId, posts: instantPosts } = await triggerScrape(groupUrls, yesterday)

    if (snapshotId) {
      await updateScrapeLog(supabase, logId, { status: 'polling', snapshot_id: snapshotId })
      await pollUntilReady(snapshotId)
    }

    let scrapedPosts: ScrapedPost[]
    if (snapshotId) {
      scrapedPosts = await downloadSnapshot(snapshotId)
    } else {
      scrapedPosts = instantPosts
    }

    const postsFetched = scrapedPosts.length
    const postsForClassification = filterPosts(scrapedPosts, yesterday, remaining)
    const postsFiltered = postsForClassification.length

    const { classified, leadsInserted } = await classifyAndStore(
      supabase,
      userId,
      postsForClassification,
      brandName ?? '',
      offer ?? '',
      targetPosts ?? '',
      retentionDays,
    )

    await updateScrapeLog(supabase, logId, {
      status: 'processed',
      posts_fetched: postsFetched,
      posts_classified: classified,
      leads_found: leadsInserted,
      completed_at: new Date().toISOString(),
    })

    if (postsFiltered > 0) {
      await incrementUsage(supabase, userId, currentMonth, postsFiltered)
      if (user.subscriptionStatus === 'trialing') {
        await incrementTrialUsage(supabase, userId, postsFiltered)
      }
    }

    return {
      userId,
      status: 'success',
      postsFetched,
      postsFiltered,
      postsClassified: classified,
      leadsFound: leadsInserted,
    }
  } catch (err) {
    const errorCode = toErrorCode(err)
    await updateScrapeLog(supabase, logId, {
      status: 'failed',
      error_message: errorCode,
      completed_at: new Date().toISOString(),
    }).catch(() => {})
    return { userId, status: 'error', postsFetched: 0, postsFiltered: 0, postsClassified: 0, leadsFound: 0, errorCode }
  }
}

async function classifyAndStore(
  supabase: SupabaseClient,
  userId: string,
  posts: PostForClassification[],
  brandName: string,
  offer: string,
  targetPosts: string,
  retentionDays: number,
): Promise<{ classified: number; leadsInserted: number }> {
  let classified = 0
  let leadsInserted = 0

  for (const post of posts) {
    try {
      const { content, ...postMeta } = post
      const result = await classifyPost(content, brandName, offer, targetPosts)
      await rateLimitDelay()

      if (!result) continue
      classified++

      if (!result.match) continue

      const isDuplicate = await checkDuplicate(supabase, userId, postMeta.content_hash)
      if (isDuplicate) continue

      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setUTCDate(expiresAt.getUTCDate() + retentionDays)

      const { error } = await supabase.from('leads').insert({
        user_id: userId,
        post_url: postMeta.url,
        source_url: postMeta.group_url,
        score: result.score,
        category: result.category,
        reason_code: result.reason_code,
        content_hash: postMeta.content_hash,
        detected_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })

      if (error) {
        if (error.code === '23505') continue
        continue
      }

      leadsInserted++
    } catch {
      continue
    }
  }

  return { classified, leadsInserted }
}

async function checkDuplicate(
  supabase: SupabaseClient,
  userId: string,
  contentHash: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('user_id', userId)
    .eq('content_hash', contentHash)
    .limit(1)
    .maybeSingle()

  return data !== null
}

function filterPosts(
  posts: ScrapedPost[],
  cutoffDate: string,
  maxPosts: number,
): PostForClassification[] {
  const cutoff = new Date(cutoffDate + 'T00:00:00Z')

  return posts
    .filter((p) => {
      if (p.content_length < MIN_CONTENT_LENGTH) return false
      const posted = parseDateAsUTC(p.date_posted)
      if (!posted) return false
      return posted >= cutoff
    })
    .slice(0, maxPosts)
    .map((p) => ({
      url: p.url,
      group_url: p.group_url,
      content_hash: p.content_hash,
      content: p.content,
    }))
}

function parseDateAsUTC(dateStr: string): Date | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'Z')
  }
  return d
}

async function getUsage(
  supabase: SupabaseClient,
  userId: string,
  month: string,
): Promise<number> {
  const { data } = await supabase
    .from('usage')
    .select('posts_processed')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  return data?.posts_processed ?? 0
}

async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  month: string,
  additionalPosts: number,
): Promise<void> {
  const current = await getUsage(supabase, userId, month)

  const { error } = await supabase
    .from('usage')
    .upsert(
      {
        user_id: userId,
        month,
        posts_processed: current + additionalPosts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,month' },
    )

  if (error) throw new Error(`Failed to increment usage`)
}

async function incrementTrialUsage(
  supabase: SupabaseClient,
  userId: string,
  additionalPosts: number,
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_posts_used')
    .eq('id', userId)
    .maybeSingle()

  const current = profile?.trial_posts_used ?? 0

  const { error } = await supabase
    .from('profiles')
    .update({ trial_posts_used: current + additionalPosts })
    .eq('id', userId)

  if (error) throw new Error('Failed to increment trial usage')
}

async function createScrapeLog(
  supabase: SupabaseClient,
  userId: string,
  groupsCount: number,
): Promise<string> {
  const { data, error } = await supabase
    .from('scrape_logs')
    .insert({
      user_id: userId,
      status: 'triggered',
      groups_count: groupsCount,
      posts_fetched: 0,
      posts_classified: 0,
      leads_found: 0,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Failed to create scrape log`)
  return data.id
}

async function updateScrapeLog(
  supabase: SupabaseClient,
  logId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('scrape_logs')
    .update(updates)
    .eq('id', logId)

  if (error) throw new Error(`Failed to update scrape log`)
}

function getYesterday(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

async function resolveGroups(
  supabase: SupabaseClient,
  profiles: { id: string; brand_name: string | null; offer: string | null; target_posts: string | null; retention_days: number; subscription_status: string; trial_posts_used: number; trial_ends_at: string | null }[],
): Promise<UserWithGroups[]> {
  const users: UserWithGroups[] = []

  for (const profile of profiles) {
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('url')
      .eq('user_id', profile.id)
      .eq('is_active', true)

    if (groupsError) {
      throw new Error(`Failed to fetch groups`)
    }

    if (groups && groups.length > 0) {
      users.push({
        userId: profile.id,
        brandName: profile.brand_name,
        offer: profile.offer,
        targetPosts: profile.target_posts,
        retentionDays: profile.retention_days,
        subscriptionStatus: profile.subscription_status,
        trialPostsUsed: profile.trial_posts_used,
        trialEndsAt: profile.trial_ends_at,
        groups,
      })
    }
  }

  return users
}

export async function fetchActiveUsers(
  supabase: SupabaseClient,
): Promise<UserWithGroups[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, brand_name, offer, target_posts, retention_days, subscription_status, trial_posts_used, trial_ends_at')
    .in('subscription_status', ['active', 'trialing'])

  if (error) throw new Error(`Failed to fetch profiles`)
  return resolveGroups(supabase, profiles ?? [])
}

export async function fetchDueUsers(
  supabase: SupabaseClient,
): Promise<(UserWithGroups & { scrapeHour: number; scrapeTimezone: string; scrapeDays: string })[]> {
  const now = new Date().toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, brand_name, offer, target_posts, retention_days, scrape_hour, scrape_timezone, scrape_days, subscription_status, trial_posts_used, trial_ends_at')
    .in('subscription_status', ['active', 'trialing'])
    .lte('next_scrape_at', now)
    .or(`scrape_lock_until.is.null,scrape_lock_until.lt.${now}`)

  if (error) throw new Error(`Failed to fetch profiles`)
  if (!profiles || profiles.length === 0) return []

  const users = await resolveGroups(supabase, profiles)

  return users.map((user) => {
    const profile = profiles.find((p) => p.id === user.userId)!
    return {
      ...user,
      scrapeHour: profile.scrape_hour,
      scrapeTimezone: profile.scrape_timezone,
      scrapeDays: profile.scrape_days,
    }
  })
}
