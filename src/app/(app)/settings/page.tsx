import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Group } from '@/lib/types'
import BrandForm from './brand-form'
import GroupList from './group-list'
import ScheduleForm from './schedule-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, brand_name, brand_description, scrape_hour, scrape_timezone, scrape_frequency')
    .eq('id', user.id)
    .single<Pick<Profile, 'subscription_status' | 'brand_name' | 'brand_description' | 'scrape_hour' | 'scrape_timezone' | 'scrape_frequency'>>()

  if (profile?.subscription_status !== 'active') {
    redirect('/billing')
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('id, user_id, url, name, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Configuration</span>
        <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Settings</h1>
        <p className="text-[15px] leading-[1.5] text-ink-600">Tell us who you sell to, which groups to watch, and when to check them.</p>
      </div>

      <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card">
        <div className="mb-3.5">
          <span className="eyebrow">Step 1</span>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Brand</h2>
        </div>
        <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Describe your brand so the AI knows what leads to look for.</p>
        <BrandForm
          initialName={profile.brand_name ?? ''}
          initialDescription={profile.brand_description ?? ''}
        />
      </section>

      <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card">
        <div className="mb-3.5 flex items-baseline justify-between gap-3.5">
          <div>
            <span className="eyebrow">Step 2</span>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Facebook groups</h2>
          </div>
          <span className="font-mono text-[12px] tabular-nums text-ink-500">{(groups ?? []).length} / 10 groups</span>
        </div>
        <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Add public Facebook groups to monitor for leads.</p>
        <GroupList groups={(groups as Group[]) ?? []} />
      </section>

      <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card">
        <div className="mb-3.5">
          <span className="eyebrow">Step 3</span>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Scrape schedule</h2>
        </div>
        <p className="-mt-1.5 mb-[18px] text-[13.5px] leading-[1.5] text-ink-600">Choose when your groups are checked for new leads.</p>
        <ScheduleForm
          initialHour={profile.scrape_hour}
          initialTimezone={profile.scrape_timezone}
          initialFrequency={profile.scrape_frequency}
        />
      </section>
    </div>
  )
}
