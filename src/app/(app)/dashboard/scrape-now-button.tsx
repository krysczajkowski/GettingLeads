'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Phase = 'idle' | 'queued' | 'scraping' | 'done' | 'background'

export default function ScrapeNowButton({
  initialLocked,
  initialQueued,
  trialCapHit,
  hasActiveGroups,
}: {
  initialLocked: boolean
  initialQueued: boolean
  trialCapHit: boolean
  hasActiveGroups: boolean
}) {
  const initialPhase: Phase = initialLocked ? 'scraping' : initialQueued ? 'queued' : 'idle'
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hadLockRef = useRef(initialLocked)
  const router = useRouter()

  const POLL_INTERVAL = 5_000
  const POLL_TIMEOUT = 15 * 60 * 1000

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startPolling() {
    stopPolling()
    const deadline = Date.now() + POLL_TIMEOUT

    intervalRef.current = setInterval(async () => {
      if (Date.now() > deadline) {
        stopPolling()
        setPhase('background')
        return
      }

      try {
        const res = await fetch('/api/scrape-now')
        if (!res.ok) return
        const data = await res.json()

        if (data.locked) {
          hadLockRef.current = true
          setPhase('scraping')
        } else if (hadLockRef.current) {
          stopPolling()
          setPhase('done')
          router.refresh()
          setTimeout(() => setPhase('idle'), 3000)
        }
      } catch {
        // Network error — keep polling
      }
    }, POLL_INTERVAL)
  }

  useEffect(() => {
    if (initialLocked || initialQueued) {
      startPolling()
    }
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleClick() {
    setError(null)
    setPhase('queued')

    const res = await fetch('/api/scrape-now', { method: 'POST' })

    if (!res.ok) {
      const data = await res.json()
      switch (data.error) {
        case 'rate_limited':
          setError('Please wait 15 minutes between manual scrapes.')
          setPhase('idle')
          break
        case 'locked':
          hadLockRef.current = true
          setPhase('scraping')
          startPolling()
          return
        case 'trial_cap_hit':
          setError('Trial post limit reached.')
          setPhase('idle')
          break
        case 'no_active_groups':
          setError('Add an active group in Settings first.')
          setPhase('idle')
          break
        default:
          setError('Something went wrong. Try again.')
          setPhase('idle')
      }
      return
    }

    hadLockRef.current = false
    startPolling()
  }

  const disabled =
    trialCapHit ||
    !hasActiveGroups ||
    phase === 'queued' ||
    phase === 'scraping' ||
    phase === 'done'

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12.5px] font-medium transition-all duration-[200ms] disabled:cursor-not-allowed disabled:opacity-50 ${
          phase === 'done'
            ? 'bg-brand-press text-fg-on-brand'
            : 'bg-brand text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_2px_6px_-1px_rgba(21,179,108,0.35)] hover:-translate-y-px hover:bg-brand-hover active:translate-y-0 active:scale-[0.985]'
        }`}
      >
        {phase === 'queued' && (
          <>
            <span className="h-3 w-3 rounded-full border-[1.5px] border-white/40 border-t-white animate-[gl-radar-sweep_0.6s_linear_infinite]" />
            Queued...
          </>
        )}
        {phase === 'scraping' && (
          <>
            <span className="h-3 w-3 rounded-full border-[1.5px] border-white/40 border-t-white animate-[gl-radar-sweep_0.6s_linear_infinite]" />
            Scraping...
          </>
        )}
        {phase === 'done' && (
          <>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
            Done
          </>
        )}
        {phase === 'background' && 'Scrape Now'}
        {phase === 'idle' && 'Scrape Now'}
      </button>
      {error && <p className="text-[11.5px] text-danger-500">{error}</p>}
      {(phase === 'queued' || phase === 'scraping') && (
        <p className="text-[11.5px] text-ink-500">This usually takes up to <span className="font-semibold">10 minutes</span>.</p>
      )}
      {phase === 'background' && (
        <p className="text-[11.5px] text-ink-500">Still running in the background.</p>
      )}
    </div>
  )
}
