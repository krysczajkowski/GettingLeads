import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import type { Profile } from '@/lib/types'

const MAX_REQUESTS = 3
const WINDOW_MS = 60 * 60 * 1000

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!rateLimit(`delete-account:${user.id}`, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('stripe_customer_id, subscription_id, subscription_status')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'stripe_customer_id' | 'subscription_id' | 'subscription_status'>>()

  if (profileError) {
    console.error('[account/delete] profile read failed:', profileError.code)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  if (profile?.subscription_id && profile.subscription_status !== 'canceled') {
    try {
      await getStripe().subscriptions.cancel(profile.subscription_id)
    } catch {
      console.error('[account/delete] stripe cancel failed')
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('[account/delete] deleteUser failed:', deleteError.code)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
