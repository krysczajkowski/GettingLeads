import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status'>>()

  const isActive = profile?.subscription_status === 'active'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {isActive ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
          <p className="font-medium text-green-800">Your subscription is active.</p>
          <p className="mt-2 text-sm text-green-700">
            Manage your subscription through the customer portal.
          </p>
          {/* Stripe portal button will be added in Phase 3 */}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">GettingLeads Pro</h2>
          <p className="mt-1 text-3xl font-bold text-gray-900">$50<span className="text-base font-normal text-gray-500">/month</span></p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 text-left max-w-xs mx-auto">
            <li>Up to 10 Facebook groups monitored</li>
            <li>5,000 posts processed per month</li>
            <li>Daily AI-powered lead classification</li>
            <li>Dashboard with lead scoring</li>
          </ul>
          {/* Stripe checkout button will be added in Phase 3 */}
          <p className="mt-6 text-sm text-gray-400">Payment integration coming soon.</p>
        </div>
      )}
    </div>
  )
}
