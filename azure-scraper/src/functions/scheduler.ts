import { app, output, InvocationContext, Timer } from '@azure/functions'
import { getSupabase } from '../lib/supabase'
import { fetchDueUsers } from '../lib/pipeline'
import { computeNextScrapeAt, ScrapeMessage } from '../lib/schedule'

const LOCK_DURATION_MS = 15 * 60 * 1000

const queueOutput = output.storageQueue({
  queueName: 'scrape-jobs',
  connection: 'AzureWebJobsStorage',
})

async function scheduler(timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    context.warn('Scheduler timer is past due — running anyway')
  }

  const supabase = getSupabase()
  const now = new Date()

  let dueUsers
  try {
    dueUsers = await fetchDueUsers(supabase)
  } catch {
    context.error('Scheduler: failed to fetch due users')
    return
  }

  if (dueUsers.length === 0) {
    context.log('Scheduler: no users due')
    return
  }

  context.log(`Scheduler: ${dueUsers.length} user(s) due`)

  const messages: ScrapeMessage[] = []

  for (const user of dueUsers) {
    const lockUntil = new Date(now.getTime() + LOCK_DURATION_MS).toISOString()
    const nextScrapeAt = computeNextScrapeAt(
      user.scrapeHour,
      user.scrapeTimezone,
      user.scrapeDays,
      now,
    )

    if (!nextScrapeAt) {
      context.log(`Scheduler: user ${user.userId} skipped — paused (no days selected)`)
      continue
    }

    const { data: updated } = await supabase
      .from('profiles')
      .update({
        scrape_lock_until: lockUntil,
        next_scrape_at: nextScrapeAt.toISOString(),
      })
      .eq('id', user.userId)
      .or(`scrape_lock_until.is.null,scrape_lock_until.lt.${now.toISOString()}`)
      .select('id')

    if (!updated || updated.length === 0) {
      context.log(`Scheduler: user ${user.userId} skipped — already locked`)
      continue
    }

    messages.push({
      userId: user.userId,
      brandName: user.brandName,
      offer: user.offer,
      targetPosts: user.targetPosts,
      retentionDays: user.retentionDays,
      groups: user.groups,
      scrapeHour: user.scrapeHour,
      scrapeTimezone: user.scrapeTimezone,
      scrapeDays: user.scrapeDays,
    })
  }

  if (messages.length > 0) {
    context.extraOutputs.set(queueOutput, messages)
    context.log(`Scheduler: enqueued ${messages.length} message(s)`)
  }
}

app.timer('scheduler', {
  schedule: '0 */5 * * * *',
  handler: scheduler,
  extraOutputs: [queueOutput],
})
