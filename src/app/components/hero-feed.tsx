'use client'

import { useState, useEffect } from 'react'

type FeedLead = {
  id: number
  initials: string
  name: string
  group: string
  score: number
  when: string
  before: string
  highlight: string
  after: string
  tags: string[]
  isNew?: boolean
}

function ScoreChip({ score }: { score: number }) {
  const bg = score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-warn-50' : 'bg-surface-2'
  const fg = score >= 80 ? 'text-green-700' : score >= 50 ? 'text-warn-700' : 'text-ink-600'
  return (
    <span className={`inline-flex items-baseline gap-[3px] rounded-[6px] px-2 py-1 font-mono text-[12px] font-semibold ${bg} ${fg}`}>
      {score}<span className="text-[10px] font-normal opacity-50">/100</span>
    </span>
  )
}

function LeadCard({ lead }: { lead: FeedLead }) {
  return (
    <div className={`rounded-[10px] border border-line-1 bg-white p-3.5 shadow-card ${lead.isNew ? 'animate-[gl-fade-in_500ms_ease-out]' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-green-100 bg-green-50 font-mono text-[11px] font-semibold text-green-700">
            {lead.initials}
          </div>
          <div className="flex flex-col leading-[1.15]">
            <span className="text-[13px] font-medium">{lead.name}</span>
            <span className="font-mono text-[11px] text-ink-500">{lead.group}</span>
          </div>
        </div>
        <ScoreChip score={lead.score} />
      </div>
      <p className="mt-2 text-[13px] leading-[1.5] text-ink-700">
        {lead.before}
        <mark className="bg-green-50 px-0.5 text-green-800">{lead.highlight}</mark>
        {lead.after}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1">
          {lead.tags.map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-600">{t}</span>
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-500">{lead.when}</span>
      </div>
    </div>
  )
}

const initial: FeedLead[] = [
  {
    id: 1, initials: 'MR', name: 'Marisa R.', group: 'Shopify Founders · 47k', score: 94, when: '4m ago',
    before: '"Anyone know a good ', highlight: '3PL for skincare brands', after: ' shipping out of CA? Currently doing 800 orders/month."',
    tags: ['fulfillment', 'us'],
  },
  {
    id: 2, initials: 'JT', name: 'Jordan T.', group: 'SaaS Operators · 22k', score: 71, when: '18m ago',
    before: '"Looking for recs — what\'s everyone using for ', highlight: 'cold email warmup', after: ' these days?"',
    tags: ['cold-email', 'saas'],
  },
  {
    id: 3, initials: 'AK', name: 'Aria K.', group: 'DTC CMOs · 14k', score: 88, when: '32m ago',
    before: '"Have a $40k/mo Meta budget and need a new ', highlight: 'agency for creative testing', after: '. DM-friendly recs?"',
    tags: ['agency', 'meta'],
  },
]

const incoming: FeedLead[] = [
  {
    id: 100, initials: 'DV', name: 'Devon V.', group: 'Agency Owners · 19k', score: 91, when: 'just now',
    before: '"My CRM is a graveyard. Anyone tried ', highlight: 'an AI tool that finds leads', after: ' in groups for you?"',
    tags: ['intent', 'hot'],
  },
  {
    id: 101, initials: 'PS', name: 'Priya S.', group: 'Ecom Insiders · 31k', score: 83, when: 'just now',
    before: '"We sell to ', highlight: 'plant-based food brands', after: '. Where are they hanging out these days?"',
    tags: ['icp', 'food'],
  },
]

export default function HeroFeed() {
  const [feed, setFeed] = useState<FeedLead[]>(initial)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      if (i >= incoming.length) { clearInterval(id); return }
      const item = incoming[i]
      setFeed(f => [{ ...item, isNew: true }, ...f].slice(0, 4))
      setNewCount(n => n + 1)
      i++
    }, 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-600">
          <span className="h-[7px] w-[7px] rounded-full bg-brand shadow-[0_0_0_3px_rgba(21,179,108,0.18)]" />
          Live · matching now
        </span>
        <span className="font-mono text-[11px] text-ink-500">
          {(284 + newCount).toLocaleString()} leads today
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {feed.map((l) => (
          <LeadCard key={l.id} lead={l} />
        ))}
      </div>
    </div>
  )
}
