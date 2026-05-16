'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import GLLogo from '@/app/components/gl-logo'
import AuthAside from '../auth-aside'
import { LockIcon, ArrowIcon } from '../auth-icons'
import { StrengthMeter, strengthOf } from '../strength-meter'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (strengthOf(password) < 2) {
      setError('Password is too weak.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Could not update password. Your reset link may have expired.')
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
              Password reset
            </span>

            {/* Headline */}
            <h1 className="mb-3 text-[40px] font-semibold leading-[1.05] tracking-[-0.028em] text-ink-1000 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_60ms_both]">
              Choose a new <span className="font-serif text-brand" style={{ fontWeight: 400 }}>password.</span>
            </h1>
            <p className="mb-8 text-[15px] leading-relaxed text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_120ms_both]">
              Pick something strong — at least 8 characters with mixed case and a number.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-4 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_180ms_both]">
                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[13px] font-medium text-ink-700">New password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm" className="text-[13px] font-medium text-ink-700">Confirm password</label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                    <input
                      id="confirm"
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-[10px] border border-line-2 bg-white pl-[38px] pr-16 text-[14px] text-ink-1000 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-brand focus:shadow-focus"
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
                {loading ? 'Updating...' : <>Update password <ArrowIcon className="h-4 w-4" /></>}
              </button>
            </form>

            {/* Link to forgot in case link expired */}
            <p className="mt-6 text-center text-[13px] text-ink-600 animate-[gl-fade-in_600ms_cubic-bezier(0.22,1,0.36,1)_300ms_both]">
              Link expired?{' '}
              <Link href="/forgot-password" className="ml-1 font-medium text-brand no-underline hover:underline hover:decoration-brand hover:underline-offset-[3px]">Request a new one</Link>
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
