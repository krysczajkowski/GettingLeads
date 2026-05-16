'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'
import GLLogo from '@/app/components/gl-logo'
import AuthAside from '../auth-aside'
import { MailIcon, LockIcon, UserIcon, BuildingIcon, ArrowIcon } from '../auth-icons'

function strengthOf(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 3)
}

function StrengthMeter({ value }: { value: string }) {
  const s = strengthOf(value)
  const labels = ['Too short', 'Weak', 'Okay', 'Strong']
  const barColors = ['', 'bg-danger-500', 'bg-warn-500', 'bg-brand']
  return (
    <div className="mt-0.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-[2px] transition-colors duration-200 ${s > i ? barColors[s] : 'bg-surface-3'}`}
          />
        ))}
      </div>
      <span className="w-[60px] text-right font-mono text-[11px] text-ink-500">{labels[s]}</span>
    </div>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
      },
    })

    if (error) {
      setError('Could not create account. Please try again.')
      setLoading(false)
      return
    }

    if (data.user && data.user.identities?.length === 0) {
      setError('An account with this email already exists. Try logging in.')
      setLoading(false)
      return
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
            We sent a confirmation link to <strong className="font-medium text-ink-1000">{email}</strong>. Click it to activate your account.
          </p>
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
          <span className="hidden text-[13px] text-ink-600 sm:inline">Already have an account?</span>
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
            {/* Tabs */}
            <div className="mb-6 inline-flex rounded-full border border-line-1 bg-surface-2 p-1">
              <Link href="/login" className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-600 no-underline transition-colors duration-200 hover:text-ink-1000">Log in</Link>
              <span className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink-1000 shadow-[0_1px_0_rgba(11,15,14,0.06),0_2px_4px_rgba(11,15,14,0.04)]">Sign up</span>
            </div>

            {/* Eyebrow */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              14-day free trial · no card
            </span>

            {/* Headline */}
            <h1 className="mb-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.028em] text-ink-1000 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_60ms_both]">
              Start your <span className="font-serif text-brand" style={{ fontWeight: 400 }}>scanner.</span>
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_120ms_both]">
              Create an account and we&apos;ll have your first leads scored before lunch.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-4 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_180ms_both]">
                {/* Name + Company row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-[13px] font-medium text-ink-700">Full name</label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input
                        id="name"
                        type="text"
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className="h-11 w-full rounded-[10px] border border-line-2 bg-white pl-[38px] pr-3 text-[14px] text-ink-1000 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company" className="text-[13px] font-medium text-ink-700">Company</label>
                    <div className="relative">
                      <BuildingIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                      <input
                        id="company"
                        type="text"
                        placeholder="Acme Co."
                        autoComplete="organization"
                        className="h-11 w-full rounded-[10px] border border-line-2 bg-white pl-[38px] pr-3 text-[14px] text-ink-1000 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
                      />
                    </div>
                  </div>
                </div>

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
                    <label htmlFor="su-pw" className="text-[13px] font-medium text-ink-700">Password</label>
                    <span className="font-mono text-[11px] text-ink-500">8+ characters</span>
                  </div>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      id="su-pw"
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Pick a strong one"
                      autoComplete="new-password"
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
                  <StrengthMeter value={password} />
                </div>

                {/* Terms checkbox */}
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.5] text-ink-700 select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="auth-check-input mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[4px] border border-line-3 bg-white transition-all duration-200 checked:border-brand checked:bg-brand"
                  />
                  <span>
                    I agree to the <a href="#" className="text-ink-1000 underline decoration-line-3 underline-offset-[3px] hover:decoration-brand">Terms</a> and <a href="#" className="text-ink-1000 underline decoration-line-3 underline-offset-[3px] hover:decoration-brand">Privacy policy</a>. We only watch public posts — never DMs.
                  </span>
                </label>
              </div>

              {error && <p className="mb-3 text-[13px] text-danger-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-200 hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_10px_20px_-4px_rgba(21,179,108,0.5)] active:translate-y-0 active:scale-[0.985] disabled:opacity-50 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_240ms_both]"
              >
                {loading ? 'Creating account...' : <>Create account <ArrowIcon className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Switch link */}
            <p className="mt-6 text-center text-[13px] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_300ms_both]">
              Already on GettingLeads?{' '}
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
        <AuthAside mode="signup" />
      </div>
    </div>
  )
}
