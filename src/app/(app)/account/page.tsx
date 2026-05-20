import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExportData from './export-data'
import DeleteAccount from './delete-account'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Privacy</span>
        <h1 className="text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000 md:text-[36px]">Account</h1>
        <p className="text-[15px] leading-[1.5] text-ink-600">Manage your data and account.</p>
      </div>

      <section className="mb-4 rounded-[16px] border border-line-1 bg-white p-6 shadow-card">
        <div className="mb-3.5">
          <span className="eyebrow">Your data</span>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">Export data</h2>
        </div>
        <ExportData />
      </section>

      <section className="mb-4 rounded-[16px] border border-danger-500 bg-white p-6 shadow-card">
        <div className="mb-3.5">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-danger-600">Danger zone</span>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.015em] text-danger-700">Delete account</h2>
        </div>
        <DeleteAccount />
      </section>
    </div>
  )
}
