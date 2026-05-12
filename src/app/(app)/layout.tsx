import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 border-r border-gray-200 bg-white p-4">
        <h2 className="mb-6 text-lg font-bold text-gray-900">GettingLeads</h2>
        <nav className="space-y-1">
          {isActive && (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/settings">Settings</NavLink>
            </>
          )}
          <NavLink href="/billing">Billing</NavLink>
        </nav>
        <form action="/api/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </Link>
  )
}
