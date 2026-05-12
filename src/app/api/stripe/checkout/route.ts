import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import type { Profile } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const stripe = getStripe()
  const { origin } = new URL(request.url)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'stripe_customer_id'>>()

  if (profileError) {
    console.error('[checkout] profile read failed:', profileError.code, profileError.message)
    return NextResponse.json({ error: 'Failed to initialize billing' }, { status: 500 })
  }

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    const { error: updateError } = await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)

    if (updateError) {
      console.error('[checkout] admin update failed:', updateError.code, updateError.message)
      return NextResponse.json({ error: 'Failed to initialize billing' }, { status: 500 })
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/billing/success`,
    cancel_url: `${origin}/billing/cancel`,
  })

  return NextResponse.json({ url: session.url })
}
