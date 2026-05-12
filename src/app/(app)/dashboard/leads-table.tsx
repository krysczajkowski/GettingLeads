'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
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

function scoreColor(score: number): string {
  if (score >= 0.8) return 'bg-green-100 text-green-800'
  if (score >= 0.5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-700'
}

function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

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

  const hasMore = leads.length < totalCount

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
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p>No leads found yet. Your daily scrape runs at 6 AM UTC — check back tomorrow.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Leads <span className="text-sm font-normal text-gray-500">({totalCount})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Post</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  {isSafeUrl(lead.post_url) ? (
                    <a
                      href={lead.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View post
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Invalid link</span>
                  )}
                </td>
                <td className="max-w-[200px] truncate px-6 py-4 text-sm text-gray-700">
                  {lead.source_url}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${scoreColor(lead.score)}`}>
                    {Math.round(lead.score * 100)}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                  {formatCategory(lead.category)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {lead.reason_code.replace(/_/g, ' ')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(lead.detected_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-gray-200 px-6 py-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load more (${leads.length} of ${totalCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
