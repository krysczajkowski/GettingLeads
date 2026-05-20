import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

const MAX_REQUESTS = 5
const WINDOW_MS = 60 * 60 * 1000

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!rateLimit(`export:${user.id}`, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const [profileRes, groupsRes, leadsRes, usageRes, logsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('email, brand_name, offer, target_posts, retention_days, scrape_hour, scrape_timezone, scrape_days, subscription_status, trial_ends_at, trial_posts_used, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('groups')
      .select('url, name, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('leads')
      .select('post_url, source_url, score, category, reason_code, detected_at, expires_at')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false }),
    supabase
      .from('usage')
      .select('month, posts_processed')
      .eq('user_id', user.id)
      .order('month', { ascending: false }),
    supabase
      .from('scrape_logs')
      .select('status, groups_count, posts_fetched, posts_classified, leads_found, started_at, completed_at')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false }),
  ])

  const queryError = profileRes.error ?? groupsRes.error ?? leadsRes.error ?? usageRes.error ?? logsRes.error

  if (queryError) {
    console.error('[account/export] data read failed:', queryError.code)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }

  const exported = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data,
    groups: groupsRes.data ?? [],
    leads: leadsRes.data ?? [],
    usage: usageRes.data ?? [],
    scrape_logs: logsRes.data ?? [],
  }

  return new Response(JSON.stringify(exported, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="gettingleads-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
