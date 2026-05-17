import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { TRIAL_POST_CAP } from '@/lib/subscription'
import type { Profile } from '@/lib/types'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  if (!rateLimit(`scrape-now:${user.id}`, 1, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('scrape_lock_until, trial_posts_used, subscription_status')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'scrape_lock_until' | 'trial_posts_used' | 'subscription_status'>>()

  if (!profile) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  if (profile.scrape_lock_until && new Date(profile.scrape_lock_until) > new Date()) {
    return NextResponse.json({ error: 'locked' }, { status: 409 })
  }

  if (profile.subscription_status === 'trialing' && profile.trial_posts_used >= TRIAL_POST_CAP) {
    return NextResponse.json({ error: 'trial_cap_hit' }, { status: 403 })
  }

  const { count: activeGroupCount } = await supabase
    .from('groups')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if ((activeGroupCount ?? 0) === 0) {
    return NextResponse.json({ error: 'no_active_groups' }, { status: 422 })
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ next_scrape_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    console.error('[scrape-now] profile update failed', { code: updateError.code })
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('scrape_lock_until')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'scrape_lock_until'>>()

  if (error) {
    console.error('[scrape-now] GET query failed', { code: error.code })
    return NextResponse.json({ error: 'server_error' }, { status: 503 })
  }

  const locked = !!profile?.scrape_lock_until && new Date(profile.scrape_lock_until) > new Date()

  return NextResponse.json({ locked })
}
