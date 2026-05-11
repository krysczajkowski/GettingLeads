import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SubscriptionStatus } from '@/lib/types'
import Stripe from 'stripe'

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    default:
      return 'inactive'
  }
}

async function updateSubscription(
  customerId: string,
  fields: { subscription_status: SubscriptionStatus; subscription_id?: string | null },
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('stripe_customer_id', customerId)

  if (error) throw new Error(`Supabase update failed: ${error.message}`)
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription' || !session.customer || !session.subscription) break

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        await updateSubscription(customerId, {
          subscription_status: mapStripeStatus(subscription.status),
          subscription_id: subscriptionId,
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

        await updateSubscription(customerId, {
          subscription_status: mapStripeStatus(subscription.status),
          subscription_id: subscription.id,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

        await updateSubscription(customerId, {
          subscription_status: 'canceled',
          subscription_id: null,
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.parent?.type !== 'subscription_details') break
        if (!invoice.customer) break
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id

        await updateSubscription(customerId, {
          subscription_status: 'past_due',
        })
        break
      }
    }
  } catch (err) {
    console.error('[webhook] handler failed:', err)
    return new Response('Internal error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
