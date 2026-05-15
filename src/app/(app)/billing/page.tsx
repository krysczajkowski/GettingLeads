import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'
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
    .select('subscription_status')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status'>>()

  const isActive = profile?.subscription_status === 'active'

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Plan & invoices</span>
        <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">Billing</h1>
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
      ) : (
        <div className="mb-4 rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-card">
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
