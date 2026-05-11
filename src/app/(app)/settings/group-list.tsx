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
      setError(insertError.message)
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
      setError(deleteError.message)
      setDeletingId(null)
      return
    }

    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {groups.length === 0 ? (
        <p className="text-sm text-gray-500">No groups added yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {groups.map((group) => (
            <li key={group.id} className="flex items-center justify-between py-3">
              <a
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-blue-600 hover:underline"
              >
                {group.url}
              </a>
              <button
                type="button"
                onClick={() => handleDelete(group.id)}
                disabled={deletingId === group.id}
                className="ml-4 shrink-0 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deletingId === group.id ? 'Removing...' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={atLimit}
          placeholder={atLimit ? `Limit of ${MAX_GROUPS} groups reached` : 'https://facebook.com/groups/...'}
          className="block flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={adding || atLimit}
          className="shrink-0 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add'}
        </button>
      </form>

      <p className="text-xs text-gray-400">{groups.length} / {MAX_GROUPS} groups</p>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
