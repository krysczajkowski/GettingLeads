'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-1">
      <div className="w-full max-w-sm space-y-6 rounded-[16px] border border-line-1 bg-white p-8 shadow-card">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.25"/>
            <circle cx="16" cy="16" r="8.5" stroke="#15B36C" strokeWidth="1.6" opacity="0.5"/>
            <path d="M16 16 L16 2.5 A13.5 13.5 0 0 1 27.7 9.25 Z" fill="#15B36C" fillOpacity="0.18"/>
            <path d="M16 2.5 A13.5 13.5 0 0 1 27.7 9.25" stroke="#15B36C" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="2.4" fill="#15B36C"/>
            <circle cx="23.4" cy="7.4" r="2.1" fill="#15B36C"/>
          </svg>
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink-1000">GettingLeads</span>
        </div>

        <h1 className="text-center text-[24px] font-semibold tracking-[-0.02em] text-ink-1000">Log in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13.5px] font-medium text-ink-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-line-2 px-3 py-2.5 text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13.5px] font-medium text-ink-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-line-2 px-3 py-2.5 text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
            />
          </div>

          {error && <p className="text-[13px] text-danger-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-brand px-4 py-2.5 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover active:translate-y-0 active:scale-[0.985] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-[14px] text-ink-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-brand hover:text-brand-hover">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
