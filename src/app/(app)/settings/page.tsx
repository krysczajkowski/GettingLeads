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
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Brand</h2>
        <p className="mt-1 text-sm text-gray-500">
          Describe your brand so the AI knows what leads to look for.
        </p>
        <div className="mt-4">
          <BrandForm
            initialName={profile.brand_name ?? ''}
            initialDescription={profile.brand_description ?? ''}
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Facebook Groups</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add public Facebook groups to monitor for leads.
        </p>
        <div className="mt-4">
          <GroupList groups={(groups as Group[]) ?? []} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Scrape Schedule</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose when your groups are checked for new leads.
        </p>
        <div className="mt-4">
          <ScheduleForm
            initialHour={profile.scrape_hour}
            initialTimezone={profile.scrape_timezone}
            initialFrequency={profile.scrape_frequency}
          />
        </div>
      </section>
    </div>
  )
}
