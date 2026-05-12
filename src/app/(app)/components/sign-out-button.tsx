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
      className="text-sm text-gray-500 hover:text-gray-700"
    >
      Sign out
    </button>
  )
}
