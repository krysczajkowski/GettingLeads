'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import GLLogo from '@/app/components/gl-logo'
import AuthAside from '../auth-aside'
import { MailIcon, LockIcon, ArrowIcon } from '../auth-icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top nav */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line-1 bg-white/72 px-8 backdrop-blur-[14px]">
        <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-ink-1000 no-underline">
          <GLLogo size={24} />
          GettingLeads
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-ink-600 sm:inline">Don&apos;t have an account?</span>
          <Link href="/signup" className="text-[13px] font-medium text-ink-1000 no-underline hover:text-brand">Sign up →</Link>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid flex-1 grid-cols-1 min-[961px]:grid-cols-2" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Left: form column */}
        <section className="relative flex items-center justify-center overflow-hidden px-8 py-14">
          {/* Dotted grid bg */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(11,15,14,0.06) 1px, transparent 0)',
              backgroundSize: '20px 20px',
              maskImage: 'radial-gradient(ellipse at 30% 0%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 30% 0%, black 20%, transparent 70%)',
            }}
          />

          <div className="relative z-10 w-full max-w-[380px]">
            {/* Tabs */}
            <div className="mb-6 inline-flex rounded-full border border-line-1 bg-surface-2 p-1">
              <span className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink-1000 shadow-[0_1px_0_rgba(11,15,14,0.06),0_2px_4px_rgba(11,15,14,0.04)]">Log in</span>
              <Link href="/signup" className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-600 no-underline transition-colors duration-200 hover:text-ink-1000">Sign up</Link>
            </div>

            {/* Eyebrow */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              Log in · v1.2
            </span>

            {/* Headline */}
            <h1 className="mb-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.028em] text-ink-1000 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_60ms_both]">
              Welcome <span className="font-serif text-brand" style={{ fontWeight: 400 }}>back.</span>
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_120ms_both]">
              Pick up where the scanner left off. New matches are waiting.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-4 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_180ms_both]">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[13px] font-medium text-ink-700">Work email</label>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="h-11 w-full rounded-[10px] border border-line-2 bg-white pl-[38px] pr-3 text-[14px] text-ink-1000 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-[13px] font-medium text-ink-700">Password</label>
                    <span className="font-mono text-[11px] text-ink-500"><a href="#" className="text-ink-700 no-underline hover:text-brand">Forgot?</a></span>
                  </div>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 w-full rounded-[10px] border border-line-2 bg-white pl-[38px] pr-16 text-[14px] text-ink-1000 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[6px] border-0 bg-transparent px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500 transition-colors duration-200 hover:text-ink-1000"
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] text-ink-700 select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="auth-check-input mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border border-line-3 bg-white transition-all duration-200 checked:border-brand checked:bg-brand"
                  />
                  <span>Keep me signed in on this device</span>
                </label>
              </div>

              {error && <p className="mb-3 text-[13px] text-danger-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_10px_20px_-4px_rgba(21,179,108,0.5)] active:translate-y-0 active:scale-[0.985] disabled:opacity-50 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_240ms_both]"
              >
                {loading ? 'Logging in...' : <>Log in <ArrowIcon className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Switch link */}
            <p className="mt-6 text-center text-[13px] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_300ms_both]">
              New to GettingLeads?{' '}
              <Link href="/signup" className="ml-1 font-medium text-brand no-underline hover:underline hover:decoration-brand hover:underline-offset-[3px]">Start your free trial</Link>
            </p>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500">
              <a href="#" className="text-ink-600 no-underline hover:text-ink-1000">Privacy</a>
              <span>·</span>
              <a href="#" className="text-ink-600 no-underline hover:text-ink-1000">Terms</a>
              <span>·</span>
              <a href="#" className="text-ink-600 no-underline hover:text-ink-1000">Status · all systems normal</a>
            </div>
          </div>
        </section>

        {/* Right: aside */}
        <AuthAside mode="login" />
      </div>
    </div>
  )
}
