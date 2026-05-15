'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Group } from '@/lib/types'

const MAX_GROUPS = 10
const FB_GROUP_PATTERN = /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/groups\/[^/\s]+/i

function isValidFacebookGroupUrl(url: string): boolean {
  return FB_GROUP_PATTERN.test(url.trim())
}

const UsersIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 4a4 4 0 0 1 0 8"/>
  </svg>
)

const PlusIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export default function GroupList({ groups }: { groups: Group[] }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const atLimit = groups.length >= MAX_GROUPS

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = url.trim()
    if (!isValidFacebookGroupUrl(trimmed)) {
      setError('Enter a valid Facebook group URL (e.g. https://facebook.com/groups/example)')
      return
    }

    if (groups.some((g) => g.url === trimmed)) {
      setError('This group has already been added.')
      return
    }

    setAdding(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setAdding(false)
      return
    }

    const { count } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count !== null && count >= MAX_GROUPS) {
      setError(`You can monitor up to ${MAX_GROUPS} groups.`)
      setAdding(false)
      return
    }

    const { error: insertError } = await supabase.from('groups').insert({
      user_id: user.id,
      url: trimmed,
    })

    if (insertError) {
      setError('Failed to add group. Please try again.')
      setAdding(false)
      return
    }

    setUrl('')
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(groupId: string) {
    setError(null)
    setDeletingId(groupId)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated')
      setDeletingId(null)
      return
    }

    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', user.id)

    if (deleteError) {
      setError('Failed to remove group. Please try again.')
      setDeletingId(null)
      return
    }

    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {groups.length > 0 && (
        <div className="overflow-hidden rounded-[10px] border border-line-1">
          {groups.map((group, i) => (
            <div
              key={group.id}
              className={`flex items-center justify-between bg-surface-1 px-3.5 py-3 transition-colors duration-[120ms] hover:bg-surface-2 ${
                i < groups.length - 1 ? 'border-b border-line-1' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-green-100 bg-green-50 text-brand">
                  <UsersIcon />
                </span>
                <a
                  href={group.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-[13px] text-ink-1000 transition-colors duration-[120ms] hover:text-brand"
                >
                  {group.url}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(group.id)}
                disabled={deletingId === group.id}
                className="shrink-0 rounded-[6px] px-2 py-1 text-[12px] font-medium text-danger-700 transition-colors duration-[120ms] hover:bg-danger-50 disabled:opacity-50"
              >
                {deletingId === group.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <p className="text-[13px] text-ink-500">No groups added yet.</p>
      )}

      <form onSubmit={handleAdd} className="flex items-stretch gap-2.5">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={atLimit}
          placeholder={atLimit ? `Limit of ${MAX_GROUPS} groups reached` : 'https://facebook.com/groups/...'}
          className="flex-1 rounded-[10px] border border-line-2 bg-white px-3 py-2.5 text-[14px] text-ink-1000 outline-none transition-all duration-[120ms] placeholder:text-ink-400 focus:border-brand focus:shadow-focus disabled:bg-surface-2 disabled:text-ink-400"
        />
        <button
          type="submit"
          disabled={adding || atLimit}
          className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-brand px-5 py-2.5 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-ink-300 disabled:shadow-none disabled:hover:translate-y-0"
        >
          <PlusIcon /> Add
        </button>
      </form>

      <p className="font-mono text-[12px] tabular-nums text-ink-500">{groups.length} / {MAX_GROUPS} groups</p>

      {error && <p className="text-[13px] text-danger-500">{error}</p>}
    </div>
  )
}
