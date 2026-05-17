import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Group } from '@/lib/types'
import { canAccessApp, trialDaysRemaining, TRIAL_POST_CAP } from '@/lib/subscription'
import BrandForm from '../settings/brand-form'
import GroupList from '../settings/group-list'
import ScheduleForm from '../settings/schedule-form'

const STEPS = [
  { label: 'Brand', eyebrow: 'Step 1 of 4' },
  { label: 'Groups', eyebrow: 'Step 2 of 4' },
  { label: 'Schedule', eyebrow: 'Step 3 of 4' },
  { label: 'Done', eyebrow: 'Step 4 of 4' },
] as const

const CheckIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m20 6-11 11-5-5" />
  </svg>
)

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = i < current
        const isCurrent = i === current
        const isLast = i === STEPS.length - 1

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              {isCompleted ? (
                <a
                  href={`/onboarding?step=${i + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-fg-on-brand transition-all duration-[120ms] hover:bg-brand-hover"
                >
                  <CheckIcon />
                </a>
              ) : isCurrent ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-mono text-[12px] font-semibold text-fg-on-brand">
                  {i + 1}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-surface-2 font-mono text-[12px] font-semibold text-ink-500">
                  {i + 1}
                </div>
              )}
              <span className={`text-[11px] font-medium ${isCurrent ? 'text-ink-1000' : 'text-ink-500'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-2 mb-5 h-px w-8 md:w-12 ${i < current ? 'bg-brand' : 'bg-line-2'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, brand_name, offer, target_posts, scrape_hour, scrape_timezone, scrape_days, trial_ends_at, trial_posts_used')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status' | 'brand_name' | 'offer' | 'target_posts' | 'scrape_hour' | 'scrape_timezone' | 'scrape_days' | 'trial_ends_at' | 'trial_posts_used'>>()

  if (!profile || !canAccessApp(profile.subscription_status)) {
    redirect('/billing')
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('id, user_id, url, name, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { step: rawStep } = await searchParams
  const stepNum = typeof rawStep === 'string' ? parseInt(rawStep, 10) : 1
  const step = stepNum >= 1 && stepNum <= 4 ? stepNum : 1
  const stepIndex = step - 1

  const daysLeft = trialDaysRemaining(profile.trial_ends_at)
  const trialEndDate = profile.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Getting started</span>
        <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Set up your account</h1>
        <p className="text-[15px] leading-[1.5] text-ink-600">Complete these steps to start finding leads in Facebook groups.</p>
      </div>

      <StepIndicator current={stepIndex} />

      {step === 1 && (
        <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="mb-3.5">
            <span className="eyebrow">{STEPS[0].eyebrow}</span>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Describe your brand</h2>
          </div>
          <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Tell us about your business so the AI knows what to look for.</p>
          <BrandForm
            initialName={profile.brand_name ?? ''}
            initialOffer={profile.offer ?? ''}
            initialTargetPosts={profile.target_posts ?? ''}
            onSuccessHref="/onboarding?step=2"
          />
          <div className="mt-5 flex items-center justify-end">
            <a href="/onboarding?step=2" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              Skip for now &rarr;
            </a>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="mb-3.5 flex items-baseline justify-between gap-3.5">
            <div>
              <span className="eyebrow">{STEPS[1].eyebrow}</span>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Add Facebook groups</h2>
            </div>
            <span className="font-mono text-[12px] tabular-nums text-ink-500">{(groups ?? []).length} / 10 groups</span>
          </div>
          <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Add public Facebook groups to monitor for leads.</p>
          <GroupList groups={(groups as Group[]) ?? []} />
          <div className="mt-5 flex items-center justify-between">
            <a href="/onboarding?step=1" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              &larr; Back
            </a>
            <a
              href="/onboarding?step=3"
              className="inline-flex items-center gap-2 rounded-[10px] bg-brand px-[18px] py-2.5 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_8px_16px_-2px_rgba(21,179,108,0.45)] active:translate-y-0 active:scale-[0.985]"
            >
              Next &rarr;
            </a>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="mb-3.5">
            <span className="eyebrow">{STEPS[2].eyebrow}</span>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Set your schedule</h2>
          </div>
          <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Choose when your groups are checked for new leads.</p>
          <ScheduleForm
            initialHour={profile.scrape_hour}
            initialTimezone={profile.scrape_timezone}
            initialDays={profile.scrape_days}
            onSuccessHref="/onboarding?step=4"
          />
          <div className="mt-5 flex items-center justify-between">
            <a href="/onboarding?step=2" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              &larr; Back
            </a>
            <a href="/onboarding?step=4" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              Skip for now &rarr;
            </a>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.25" />
                <circle cx="16" cy="16" r="8.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.5" />
                <circle cx="16" cy="16" r="2.4" fill="#15B36C" />
                <path d="M16 2.5 A13.5 13.5 0 0 1 27.7 9.25" stroke="#15B36C" strokeWidth="1.8" strokeLinecap="round" className="origin-center animate-[gl-radar-sweep_6s_linear_infinite]" />
              </svg>
            </div>
            <span className="eyebrow">{STEPS[3].eyebrow}</span>
            <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink-1000">Your free trial has started</h2>
            <p className="mt-2 text-[15px] leading-[1.5] text-ink-600">
              {daysLeft > 0 ? (
                <>
                  You have <span className="font-semibold text-ink-1000">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> and{' '}
                  <span className="font-semibold text-ink-1000">{TRIAL_POST_CAP.toLocaleString()} posts</span> to try GettingLeads.
                </>
              ) : (
                <>Your trial has expired. Upgrade to keep finding leads.</>
              )}
            </p>
          </div>

          <div className="mb-6 rounded-[10px] border border-line-1 bg-surface-1 p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-ink-1000">What happens next</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-brand">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
                </span>
                Our scraper checks your Facebook groups on the schedule you set.
              </li>
              <li className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-brand">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
                </span>
                AI scores each post against your brand description.
              </li>
              <li className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-brand">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
                </span>
                Matching leads appear on your Dashboard, ranked by relevance.
              </li>
            </ul>
          </div>

          {trialEndDate && (
            <div className="mb-6 flex items-center justify-between rounded-[10px] border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-[13.5px] text-blue-900">Trial ends <span className="font-medium">{trialEndDate}</span></span>
              </div>
              <a href="/billing" className="text-[13px] font-medium text-blue-700 transition-colors hover:text-blue-900">
                Upgrade &rarr;
              </a>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <a
              href={profile.brand_name ? '/dashboard' : '/settings'}
              className="inline-flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_10px_20px_-4px_rgba(21,179,108,0.5)] active:translate-y-0 active:scale-[0.985]"
            >
              {profile.brand_name ? 'Go to Dashboard' : 'Finish setup in Settings'}
            </a>
            <a href="/billing" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              View billing &amp; plans
            </a>
          </div>

          <div className="mt-5 flex items-center justify-start">
            <a href="/onboarding?step=3" className="text-[13px] text-ink-500 transition-colors hover:text-ink-700">
              &larr; Back
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
