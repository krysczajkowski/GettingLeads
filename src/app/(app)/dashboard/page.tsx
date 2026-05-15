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
        <div className="mb-7 flex flex-col gap-2">
          <span className="eyebrow">Overview</span>
          <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Dashboard</h1>
        </div>
        <div className="rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-card">
          <p className="text-[15px] text-ink-600">
            Get started by setting up your brand and adding Facebook groups in{' '}
            <a href="/settings" className="font-medium text-brand hover:text-brand-hover">Settings</a>.
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
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Overview · last 7 days</span>
        <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Dashboard</h1>
        <p className="text-[15px] leading-[1.5] text-ink-600">A live look at every lead matched against your brand.</p>
      </div>

      {/* Stat strip */}
      <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-[16px] border border-line-1 bg-white shadow-card xl:grid-cols-4">
        <div className="flex flex-col gap-1.5 border-b border-r border-line-1 px-6 py-[22px] xl:border-b-0">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-500">Total leads</span>
          <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-1000">{totalLeads}</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11.5px] tabular-nums text-brand">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
            +{totalLeads} total
          </span>
        </div>
        <div className="flex flex-col gap-1.5 border-b border-line-1 px-6 py-[22px] xl:border-b-0 xl:border-r">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-500">Avg score</span>
          <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-1000">—<span className="ml-1 text-[14px] font-medium text-ink-500">%</span></span>
          <span className="font-mono text-[11.5px] tabular-nums text-ink-500">Placeholder</span>
        </div>
        <div className="flex flex-col gap-1.5 border-r border-line-1 px-6 py-[22px]">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-500">Buying intent rate</span>
          <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-1000">—<span className="ml-1 text-[14px] font-medium text-ink-500">%</span></span>
          <span className="font-mono text-[11.5px] tabular-nums text-ink-500">Placeholder</span>
        </div>
        <div className="flex flex-col gap-1.5 px-6 py-[22px]">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-500">Top group</span>
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink-1000">—</span>
          <span className="font-mono text-[11.5px] tabular-nums text-ink-500">Placeholder</span>
        </div>
      </div>

      {/* Usage card */}
      <div className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card transition-shadow duration-[200ms] hover:shadow-card-hover">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="eyebrow">This month</span>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Posts processed</h2>
          </div>
          <span className="font-mono text-[12px] tabular-nums text-ink-600">{usagePercent}% of plan</span>
        </div>
        <div className="mb-3.5 mt-[18px] flex items-end">
          <span className="text-[44px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-ink-1000">
            {postsProcessed.toLocaleString()}
            <span className="ml-1 text-[18px] font-medium text-ink-500">/ {POSTS_LIMIT.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-brand transition-[width] duration-1000"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Leads table */}
      <div className="mt-4">
        <LeadsTable
          initialLeads={(leads as Pick<Lead, 'id' | 'post_url' | 'source_url' | 'score' | 'category' | 'reason_code' | 'detected_at'>[]) ?? []}
          totalCount={totalLeads}
          pageSize={LEADS_PAGE_SIZE}
        />
      </div>
    </div>
  )
}
