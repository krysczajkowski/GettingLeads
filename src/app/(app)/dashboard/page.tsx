import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, brand_name')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status' | 'brand_name'>>()

  if (profile?.subscription_status !== 'active') {
    redirect('/billing')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        {profile.brand_name ? (
          <p>No leads found yet. Your daily scrape runs at 6 AM UTC — check back tomorrow.</p>
        ) : (
          <p>
            Get started by setting up your brand and adding Facebook groups in{' '}
            <a href="/settings" className="text-blue-600 hover:underline">Settings</a>.
          </p>
        )}
      </div>
    </div>
  )
}
