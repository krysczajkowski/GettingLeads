import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { canAccessApp, isTrialExpired } from '@/lib/subscription'
import SignOutButton from './components/sign-out-button'
import NavItem from './components/nav-item'
import MobileNav from './components/mobile-nav'

const DashIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5"/>
  </svg>
)

const CogIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>
  </svg>
)

const CardIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="2"/>
    <path d="M2.5 10h19M6 15h4"/>
  </svg>
)

const LogoMark = () => (
  <svg width={22} height={22} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="13.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.25"/>
    <circle cx="16" cy="16" r="8.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.5"/>
    <path d="M16 16 L16 2.5 A13.5 13.5 0 0 1 27.7 9.25 Z" fill="#15B36C" fillOpacity="0.18"/>
    <path d="M16 2.5 A13.5 13.5 0 0 1 27.7 9.25" stroke="#15B36C" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="2.4" fill="#15B36C"/>
    <circle cx="23.4" cy="7.4" r="2.1" fill="#15B36C"/>
  </svg>
)

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status' | 'trial_ends_at'>>()

  if (profile?.subscription_status === 'trialing' && isTrialExpired(profile.trial_ends_at)) {
    const admin = createAdminClient()
    await admin.from('profiles').update({ subscription_status: 'inactive' }).eq('id', user.id).eq('subscription_status', 'trialing')
    redirect('/billing')
  }

  const isActive = canAccessApp(profile?.subscription_status ?? 'inactive')
  const initial = (user.email ?? 'U')[0].toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-surface-1 md:flex-row">
      <MobileNav isActive={isActive} email={user.email ?? ''} initial={initial} />
      <aside className="sticky top-0 hidden h-screen w-[232px] flex-col border-r border-line-1 bg-white px-4 py-[22px] md:flex">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 pb-[18px]">
          <LogoMark />
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink-1000">GettingLeads</span>
        </div>

        {/* Workspace heading */}
        <div className="px-2.5 pb-1.5 pt-4 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-500">
          Workspace
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-px">
          {isActive && (
            <>
              <NavItem href="/dashboard" icon={<DashIcon />}>Dashboard</NavItem>
              <NavItem href="/settings" icon={<CogIcon />}>Settings</NavItem>
            </>
          )}
          <NavItem href="/billing" icon={<CardIcon />}>Billing</NavItem>
        </nav>

        {/* Live monitoring pill */}
        {isActive && (
          <div className="mx-1 mt-3.5 flex items-center gap-2 rounded-[10px] border border-green-100 bg-green-50 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-green-700">
            <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
              <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
            </span>
            Live · monitoring
          </div>
        )}

        {/* User block */}
        <div className="mt-auto border-t border-line-1 pt-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-100 bg-green-100 font-mono text-[11px] font-semibold text-green-700">
              {initial}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-medium text-ink-1000">{user.email}</span>
            </div>
          </div>
          <div className="mt-1">
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-6 md:py-8 xl:px-12 xl:py-11">{children}</main>
    </div>
  )
}
