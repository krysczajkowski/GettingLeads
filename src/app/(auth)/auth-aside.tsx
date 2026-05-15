'use client'

import { useState, useEffect } from 'react'

const SEED_LEADS = [
  { id: 1, initials: 'MR', name: 'Marisa R.', group: 'Shopify Founders · 47k', score: 94, when: '4m ago',
    before: '“Anyone know a good ', highlight: '3PL for skincare brands', after: ' shipping out of CA?”',
    tags: ['fulfillment', 'us'] },
  { id: 2, initials: 'JT', name: 'Jordan T.', group: 'SaaS Operators · 22k', score: 87, when: '12m ago',
    before: '“What’s everyone using for ', highlight: 'cold email warmup', after: ' these days?”',
    tags: ['cold-email', 'saas'] },
  { id: 3, initials: 'AK', name: 'Aria K.', group: 'DTC CMOs · 14k', score: 91, when: '28m ago',
    before: '“Need a new ', highlight: 'creative testing agency', after: '. $40k/mo Meta budget.”',
    tags: ['agency', 'meta'] },
]

const INCOMING = [
  { id: 100, initials: 'DV', name: 'Devon V.', group: 'Agency Owners · 19k', score: 92, when: 'just now',
    before: '“My CRM is a graveyard. Tried ', highlight: 'AI that finds leads', after: ' for you?”',
    tags: ['intent', 'hot'] },
  { id: 101, initials: 'PS', name: 'Priya S.', group: 'Ecom Insiders · 31k', score: 84, when: 'just now',
    before: '“We sell to ', highlight: 'plant-based food brands', after: '. Where do they hang?”',
    tags: ['icp', 'food'] },
]

type Lead = typeof SEED_LEADS[number] & { _k?: number }

function LeadCard({ lead, delay = 0 }: { lead: Lead; delay?: number }) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-[10px] border border-line-1 bg-white p-3.5 shadow-card"
      style={{ animation: `gl-fade-in 600ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-green-100 bg-green-50 font-mono text-[11px] font-semibold text-green-700">
            {lead.initials}
          </div>
          <div>
            <div className="text-[13px] font-medium leading-tight">{lead.name}</div>
            <div className="font-mono text-[11px] leading-tight text-ink-500">{lead.group}</div>
          </div>
        </div>
        <span className="inline-flex items-baseline gap-[3px] rounded-[6px] bg-green-50 px-2.5 py-1 font-mono text-[12px] font-semibold text-green-700">
          {lead.score}<span className="text-[10px] font-normal opacity-50">/100</span>
        </span>
      </div>
      <p className="m-0 text-[13px] leading-[1.5] text-ink-700">
        {lead.before}<mark className="rounded-[2px] bg-green-50 px-[2px] text-green-800">{lead.highlight}</mark>{lead.after}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {lead.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2 py-[2px] font-mono text-[11px] text-ink-600">{t}</span>
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-500">{lead.when}</span>
      </div>
    </div>
  )
}

export default function AuthAside({ mode }: { mode: 'login' | 'signup' }) {
  const [feed, setFeed] = useState<Lead[]>(SEED_LEADS)
  const [counter, setCounter] = useState(284)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      const next = INCOMING[i % INCOMING.length]
      setFeed(f => [{ ...next, _k: Date.now() }, ...f].slice(0, 3))
      setCounter(c => c + Math.floor(Math.random() * 3) + 1)
      i++
    }, 5200)
    return () => clearInterval(id)
  }, [])

  const headline = mode === 'login'
    ? <> Welcome back. <span className="font-serif text-brand" style={{ fontWeight: 400 }}>Signal&apos;s still strong.</span></>
    : <>Start turning noise into <span className="font-serif text-brand" style={{ fontWeight: 400 }}>signal.</span></>

  const sub = mode === 'login'
    ? 'Your scanner ran 19,402 posts overnight. 23 new matches are waiting in your inbox.'
    : "14 days free. No credit card. Setup in three minutes — we'll have your first leads scored by lunch."

  return (
    <aside className="relative hidden overflow-hidden border-l border-line-1 bg-surface-1 p-14 pb-10 min-[961px]:flex min-[961px]:flex-col">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(11,15,14,0.06) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse at 80% 30%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, black 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Radar disk */}
      <div className="pointer-events-none absolute -right-[200px] -top-[180px] h-[720px] w-[720px]">
        <div className="absolute inset-0 rounded-full border border-[rgba(21,179,108,0.18)]" />
        <div className="absolute inset-20 rounded-full border border-[rgba(21,179,108,0.18)]" />
        <div className="absolute inset-40 rounded-full border border-[rgba(21,179,108,0.18)]" />
        <div className="absolute inset-60 rounded-full border border-[rgba(21,179,108,0.10)]" />
        <div className="absolute inset-80 rounded-full border border-[rgba(21,179,108,0.08)]" />
        {/* Crosshairs */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[rgba(21,179,108,0.10)]" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[rgba(21,179,108,0.10)]" />
        {/* Sweep */}
        <div
          className="absolute inset-0 rounded-full animate-[gl-radar-sweep_6s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg, rgba(21,179,108,0) 0deg, rgba(21,179,108,0) 290deg, rgba(21,179,108,0.22) 355deg, rgba(21,179,108,0.45) 360deg)',
            maskImage: 'radial-gradient(circle at center, black 35%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 70%)',
          }}
        />
        {/* Pings */}
        <div className="absolute left-[55%] top-[38%] h-2 w-2 rounded-full bg-brand shadow-[0_0_0_0_rgba(21,179,108,0.6)] animate-[auth-ping_2.6s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
        <div className="absolute left-[38%] top-[52%] h-2 w-2 rounded-full bg-brand shadow-[0_0_0_0_rgba(21,179,108,0.6)] animate-[auth-ping_2.6s_cubic-bezier(0.22,1,0.36,1)_0.9s_infinite]" />
        <div className="absolute left-[62%] top-[56%] h-2 w-2 rounded-full bg-brand shadow-[0_0_0_0_rgba(21,179,108,0.6)] animate-[auth-ping_2.6s_cubic-bezier(0.22,1,0.36,1)_1.7s_infinite]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col gap-7">
        {/* Live badge + counter */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-600">
            <span className="h-[7px] w-[7px] rounded-full bg-brand shadow-[0_0_0_3px_rgba(21,179,108,0.18)]" />
            Live · scanning 1,847 groups
          </span>
          <span className="font-mono text-[11px] text-ink-500">
            {counter.toLocaleString()} leads today
          </span>
        </div>

        {/* Headline */}
        <div className="max-w-[420px]">
          <h2 className="m-0 mb-2.5 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink-1000">
            {headline}
          </h2>
          <p className="m-0 text-[14px] leading-relaxed text-ink-600">{sub}</p>
        </div>

        {/* Lead feed */}
        <div className="mt-auto flex max-w-[440px] flex-col gap-3">
          {feed.map((l, i) => (
            <LeadCard key={l._k || l.id} lead={l} delay={i * 60} />
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-5 flex max-w-[440px] flex-col gap-2.5">
          <p className="m-0 text-[18px] leading-[1.4] tracking-[-0.015em] text-ink-1000">
            <span className="font-serif" style={{ fontStyle: 'italic', fontWeight: 400 }}>&ldquo;GettingLeads pays for itself</span>{' '}
            in the time my team would&apos;ve spent doomscrolling Facebook.&rdquo;
          </p>
          <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500">
            <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-surface-3 text-[10px] font-semibold text-ink-700">EW</span>
            Elena W. · Head of Growth, Northbound
          </div>
        </div>

        {/* Stats */}
        <div className="grid max-w-[440px] grid-cols-3 border-t border-dashed border-line-2 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-[24px] font-semibold tracking-[-0.02em] text-ink-1000">1,847</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500">Groups monitored</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[24px] font-semibold tracking-[-0.02em] text-ink-1000">12.6M</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500">Members in range</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[24px] font-semibold tracking-[-0.02em] text-ink-1000">3m</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-500">Avg setup time</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
