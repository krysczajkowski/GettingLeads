import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import type { Profile } from '@/lib/types'

const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 60 * 1000

export async function POST(request: Request) {
  const supabase = await createClient()
  const { origin } = new URL(request.url)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!rateLimit(`portal:${user.id}`, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'stripe_customer_id'>>()

  if (profileError) {
    console.error('[portal] profile read failed:', profileError.code)
    return NextResponse.json({ error: 'Failed to load billing info' }, { status: 500 })
  }

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/billing`,
  })

  return NextResponse.json({ url: session.url })
}
