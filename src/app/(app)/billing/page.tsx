import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { trialDaysRemaining, TRIAL_POST_CAP } from '@/lib/subscription'
import CheckoutButton from './checkout-button'
import PortalButton from './portal-button'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at, trial_posts_used')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status' | 'trial_ends_at' | 'trial_posts_used'>>()

  const isActive = profile?.subscription_status === 'active'
  const isTrial = profile?.subscription_status === 'trialing'
  const daysLeft = isTrial ? trialDaysRemaining(profile.trial_ends_at) : 0
  const trialPostsUsed = profile?.trial_posts_used ?? 0
  const trialUsagePercent = Math.min(Math.round((trialPostsUsed / TRIAL_POST_CAP) * 100), 100)
  const trialCapHit = trialPostsUsed >= TRIAL_POST_CAP

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Plan & invoices</span>
        <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Billing</h1>
        <p className="text-[15px] leading-[1.5] text-ink-600">Manage your subscription, payment method, and history.</p>
      </div>

      {isActive ? (
        <>
          {/* Active subscription banner */}
          <div className="relative mb-4 overflow-hidden rounded-[16px] border border-green-100 bg-gradient-to-b from-green-50 to-white p-7 shadow-card">
            {/* Radar sweep decoration */}
            <div className="pointer-events-none absolute -right-20 top-1/2 h-[280px] w-[280px] -translate-y-1/2 opacity-50">
              <div className="absolute inset-0 rounded-full border border-green-200" />
              <div className="absolute inset-[30px] rounded-full border border-green-200" />
              <div className="absolute inset-[70px] rounded-full border border-green-200" />
              <div className="absolute inset-[110px] rounded-full border border-green-200" />
              <div className="absolute inset-0 animate-[gl-radar-sweep_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(21,179,108,0.35)_360deg)] mix-blend-multiply" />
            </div>

            {/* Check icon */}
            <div className="relative z-10 mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand text-white shadow-[0_4px_10px_-2px_rgba(21,179,108,0.45)]">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
            </div>
            <h2 className="relative z-10 text-[22px] font-semibold tracking-[-0.02em] text-ink-1000">Your subscription is active.</h2>
            <p className="relative z-10 mt-1.5 text-[14px] leading-[1.5] text-ink-600">Manage your subscription through the customer portal.</p>
            <div className="relative z-10 mt-[18px]">
              <PortalButton />
            </div>
          </div>
        </>
      ) : isTrial ? (
        <div className="mb-4 rounded-[16px] border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-7 shadow-card">
          <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue-100 text-blue-700">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink-1000">
            Free trial · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </h2>
          <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-600">
            You have access to the full platform during your trial.
          </p>

          <div className="mt-5 rounded-[12px] border border-line-1 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-500">Trial posts used</span>
              <span className="font-mono text-[12px] tabular-nums text-ink-600">{trialUsagePercent}%</span>
            </div>
            <div className="mb-2 mt-2 flex items-end">
              <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-1000">
                {trialPostsUsed.toLocaleString()}
                <span className="ml-1 text-[14px] font-medium text-ink-500">/ {TRIAL_POST_CAP.toLocaleString()}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-[width] duration-1000"
                style={{ width: `${trialUsagePercent}%` }}
              />
            </div>
            {trialCapHit && (
              <p className="mt-2.5 text-[13px] font-medium text-amber-700">
                Trial post limit reached — scraping is paused.
              </p>
            )}
          </div>

          <div className="mt-5">
            <h3 className="text-[16px] font-semibold text-ink-1000">Upgrade to GettingLeads Pro</h3>
            <p className="mt-1 text-[30px] font-bold tracking-[-0.02em] text-ink-1000">
              $50<span className="text-[14px] font-normal text-ink-500">/month</span>
            </p>
            <ul className="mt-3 space-y-2 text-[14px] text-ink-700">
              <li className="flex items-start gap-2.5">
                <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                5,000 posts processed per month
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                Up to 10 Facebook groups monitored
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
                Daily AI-powered lead classification
              </li>
            </ul>
            <div className="mt-5">
              <CheckoutButton />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-[16px] border border-line-1 bg-white p-5 text-center shadow-card md:p-8">
          <h2 className="text-[20px] font-semibold text-ink-1000">GettingLeads Pro</h2>
          <p className="mt-1 text-[30px] font-bold tracking-[-0.02em] text-ink-1000">
            $50<span className="text-[14px] font-normal text-ink-500">/month</span>
          </p>
          <ul className="mx-auto mt-4 max-w-xs space-y-2.5 text-left text-[14px] text-ink-700">
            <li className="flex items-start gap-2.5">
              <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
              Up to 10 Facebook groups monitored
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
              5,000 posts processed per month
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
              Daily AI-powered lead classification
            </li>
            <li className="flex items-start gap-2.5">
              <svg className="mt-1 shrink-0 text-brand" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
              Dashboard with lead scoring
            </li>
          </ul>
          <div className="mt-6">
            <CheckoutButton />
          </div>
        </div>
      )}
    </div>
  )
}
