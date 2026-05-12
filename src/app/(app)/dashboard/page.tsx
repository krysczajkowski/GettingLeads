import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Lead, Usage } from '@/lib/types'
import LeadsTable from './leads-table'

const POSTS_LIMIT = 5_000
const LEADS_PAGE_SIZE = 20

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

  if (!profile.brand_name) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p>
            Get started by setting up your brand and adding Facebook groups in{' '}
            <a href="/settings" className="text-blue-600 hover:underline">Settings</a>.
          </p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`

  const { data: usage } = await supabase
    .from('usage')
    .select('posts_processed')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .maybeSingle<Pick<Usage, 'posts_processed'>>()

  const postsProcessed = usage?.posts_processed ?? 0
  const usagePercent = Math.min(Math.round((postsProcessed / POSTS_LIMIT) * 100), 100)

  const { data: leads, count } = await supabase
    .from('leads')
    .select('id, post_url, source_url, score, category, reason_code, detected_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('detected_at', { ascending: false })
    .range(0, LEADS_PAGE_SIZE - 1)

  const totalLeads = count ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Posts processed this month</h2>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {postsProcessed.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {POSTS_LIMIT.toLocaleString()}</span>
            </p>
          </div>
          <span className="text-sm text-gray-500">{usagePercent}%</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-2 rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-blue-600'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <LeadsTable
          initialLeads={(leads as Pick<Lead, 'id' | 'post_url' | 'source_url' | 'score' | 'category' | 'reason_code' | 'detected_at'>[]) ?? []}
          totalCount={totalLeads}
          pageSize={LEADS_PAGE_SIZE}
        />
      </div>
    </div>
  )
}
