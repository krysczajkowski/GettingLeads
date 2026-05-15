'use client'

import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-[13px] text-ink-500 transition-colors duration-[120ms] hover:text-ink-700"
    >
      Sign out
    </button>
  )
}
