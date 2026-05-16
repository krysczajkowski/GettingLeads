'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import GLLogo from '@/app/components/gl-logo'
import AuthAside from '../auth-aside'
import { MailIcon, ArrowIcon } from '../auth-icons'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.status === 429) {
      setError('Too many attempts. Please wait a minute and try again.')
      setLoading(false)
      return
    }

    if (!res.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/callback?next=/reset-password`,
    })
    if (resetError) {
      console.error('[forgot-password] resetPasswordForEmail failed:', resetError.code)
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-1">
        <div className="w-full max-w-sm space-y-4 rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-card">
          <GLLogo size={24} />
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink-1000">Check your email</h1>
          <p className="text-[15px] leading-relaxed text-ink-600">
            If an account exists for <strong className="font-medium text-ink-1000">{email}</strong>, a password reset link is on its way.
          </p>
          <Link href="/login" className="mt-2 inline-block text-[13px] font-medium text-brand no-underline hover:underline hover:decoration-brand hover:underline-offset-[3px]">
            ← Back to login
          </Link>
        </div>
      </div>
    )
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
          <span className="hidden text-[13px] text-ink-600 sm:inline">Remember your password?</span>
          <Link href="/login" className="text-[13px] font-medium text-ink-1000 no-underline hover:text-brand">Log in →</Link>
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
            {/* Eyebrow */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              Account recovery
            </span>

            {/* Headline */}
            <h1 className="mb-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.028em] text-ink-1000 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_60ms_both]">
              Forgot your <span className="font-serif text-brand" style={{ fontWeight: 400 }}>password?</span>
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_120ms_both]">
              Enter the email you signed up with and we&apos;ll send a reset link.
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
              </div>

              {error && <p className="mb-3 text-[13px] text-danger-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_10px_20px_-4px_rgba(21,179,108,0.5)] active:translate-y-0 active:scale-[0.985] disabled:opacity-50 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_240ms_both]"
              >
                {loading ? 'Sending...' : <>Send reset link <ArrowIcon className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Switch link */}
            <p className="mt-6 text-center text-[13px] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_300ms_both]">
              Remember your password?{' '}
              <Link href="/login" className="ml-1 font-medium text-brand no-underline hover:underline hover:decoration-brand hover:underline-offset-[3px]">Log in</Link>
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
