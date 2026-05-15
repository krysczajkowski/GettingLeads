'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useMemo } from 'react'
import type { Lead } from '@/lib/types'

type LeadRow = Pick<Lead, 'id' | 'post_url' | 'source_url' | 'score' | 'category' | 'reason_code' | 'detected_at'>

const CATEGORY_LABELS: Record<string, string> = {
  buying_intent: 'Buying Intent',
  recommendation_request: 'Recommendation Request',
  problem_solution: 'Problem / Solution',
  comparison: 'Comparison',
  general_interest: 'General Interest',
}

function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, ' ')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function scoreClasses(score: number): string {
  if (score >= 0.8) return 'bg-green-50 text-green-700'
  if (score >= 0.5) return 'bg-warn-50 text-warn-700'
  return 'bg-surface-2 text-ink-600'
}

function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

type Filter = 'all' | '90+' | '80-89'

export default function LeadsTable({
  initialLeads,
  totalCount,
  pageSize,
}: {
  initialLeads: LeadRow[]
  totalCount: number
  pageSize: number
}) {
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const hasMore = leads.length < totalCount

  const visible = useMemo(() => {
    if (filter === '90+') return leads.filter(l => l.score >= 0.9)
    if (filter === '80-89') return leads.filter(l => l.score >= 0.8 && l.score < 0.9)
    return leads
  }, [filter, leads])

  const count90 = leads.filter(l => l.score >= 0.9).length
  const count80 = leads.filter(l => l.score >= 0.8 && l.score < 0.9).length

  async function loadMore() {
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const oldestLead = leads[leads.length - 1]

    const { data } = await supabase
      .from('leads')
      .select('id, post_url, source_url, score, category, reason_code, detected_at')
      .eq('user_id', user.id)
      .order('detected_at', { ascending: false })
      .order('id', { ascending: false })
      .lt('detected_at', oldestLead.detected_at)
      .limit(pageSize)

    if (data) {
      setLeads((prev) => [...prev, ...(data as LeadRow[])])
    }

    setLoading(false)
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-card">
        <p className="text-[15px] text-ink-600">No leads found yet. Your daily scrape runs at 6 AM UTC — check back tomorrow.</p>
      </div>
    )
  }

  const chipClass = (active: boolean) =>
    `inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-all duration-[120ms] ${
      active
        ? 'border-ink-1000 bg-ink-1000 text-white'
        : 'border-line-1 bg-white text-ink-700 hover:border-line-2 hover:bg-surface-2'
    }`

  return (
    <div className="overflow-hidden rounded-[16px] border border-line-1 bg-white shadow-card">
      {/* Header with filter chips */}
      <div className="flex items-center justify-between border-b border-line-1 px-6 py-5">
        <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-1000">
          Leads <span className="ml-1.5 font-mono text-[14px] font-normal text-ink-500">({visible.length})</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button type="button" className={chipClass(filter === 'all')} onClick={() => setFilter('all')}>
            All <span className="font-mono text-[11px] opacity-60">{leads.length}</span>
          </button>
          <button type="button" className={chipClass(filter === '90+')} onClick={() => setFilter('90+')}>
            Score 90+ <span className="font-mono text-[11px] opacity-60">{count90}</span>
          </button>
          <button type="button" className={chipClass(filter === '80-89')} onClick={() => setFilter('80-89')}>
            80-89 <span className="font-mono text-[11px] opacity-60">{count80}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Post</th>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Group</th>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Score</th>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Category</th>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Reason</th>
              <th className="border-b border-line-1 bg-surface-1 px-6 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((lead, i) => (
              <tr
                key={lead.id}
                className={`cursor-pointer transition-colors duration-[120ms] hover:bg-surface-1 ${
                  i < visible.length - 1 ? 'border-b border-line-1' : ''
                }`}
              >
                <td className="whitespace-nowrap px-6 py-3.5">
                  {isSafeUrl(lead.post_url) ? (
                    <a
                      href={lead.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[14px] font-medium text-brand transition-colors duration-[120ms] hover:text-brand-hover"
                    >
                      View post
                      <svg className="transition-transform duration-[200ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
                    </a>
                  ) : (
                    <span className="text-[14px] text-ink-400">Invalid link</span>
                  )}
                </td>
                <td className="max-w-[260px] px-6 py-3.5">
                  <span className="inline-block max-w-[260px] truncate font-mono text-[12.5px] text-ink-600">
                    {lead.source_url}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-3.5">
                  <span className={`inline-flex items-baseline gap-0.5 rounded-[6px] px-2.5 py-[3px] font-mono text-[12.5px] font-semibold tabular-nums ${scoreClasses(lead.score)}`}>
                    {Math.round(lead.score * 100)}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-3.5">
                  <span className="inline-block rounded-full border border-line-1 bg-surface-2 px-2.5 py-[3px] text-[12px] font-medium text-ink-700">
                    {formatCategory(lead.category)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-3.5 text-[13.5px] text-ink-600">
                  {lead.reason_code.replace(/_/g, ' ')}
                </td>
                <td className="whitespace-nowrap px-6 py-3.5 font-mono text-[12.5px] text-ink-500">
                  {formatDate(lead.detected_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-line-1 px-6 py-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-[14px] font-medium text-brand transition-colors duration-[120ms] hover:text-brand-hover disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load more (${leads.length} of ${totalCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
