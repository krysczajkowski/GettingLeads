import { app, InvocationContext } from '@azure/functions'
import { getSupabase } from '../lib/supabase'
import { processUser } from '../lib/pipeline'
import { ScrapeMessage } from '../lib/schedule'

function isValidMessage(msg: unknown): msg is ScrapeMessage {
  if (typeof msg !== 'object' || msg === null) return false
  const m = msg as Record<string, unknown>
  return (
    typeof m.userId === 'string' &&
    m.userId.length > 0 &&
    (m.brandName === null || typeof m.brandName === 'string') &&
    (m.offer === null || typeof m.offer === 'string') &&
    (m.targetPosts === null || typeof m.targetPosts === 'string') &&
    typeof m.retentionDays === 'number' &&
    Array.isArray(m.groups) &&
    m.groups.every((g) => typeof g === 'object' && g !== null && typeof (g as Record<string, unknown>).url === 'string') &&
    typeof m.scrapeHour === 'number' &&
    typeof m.scrapeTimezone === 'string' &&
    typeof m.scrapeDays === 'string'
  )
}

async function scrapeWorker(message: unknown, context: InvocationContext): Promise<void> {
  if (!isValidMessage(message)) {
    context.error('Worker: invalid queue message')
    return
  }

  const msg = message

  context.log(`Worker: processing user ${msg.userId} (${msg.groups.length} groups)`)

  const supabase = getSupabase()

  try {
    const result = await processUser(supabase, {
      userId: msg.userId,
      brandName: msg.brandName,
      offer: msg.offer,
      targetPosts: msg.targetPosts,
      retentionDays: msg.retentionDays,
      groups: msg.groups,
    })

    if (result.status === 'error') {
      context.error(`Worker: user ${msg.userId} failed: ${result.errorCode}`)
    } else if (result.status === 'skipped_usage') {
      context.log(`Worker: user ${msg.userId} skipped — monthly limit reached`)
    } else {
      context.log(
        `Worker: user ${msg.userId} done — ${result.postsFetched} fetched, ` +
          `${result.postsFiltered} filtered, ${result.postsClassified} classified, ` +
          `${result.leadsFound} leads`,
      )
    }
  } finally {
    await supabase
      .from('profiles')
      .update({ scrape_lock_until: null })
      .eq('id', msg.userId)
  }
}

app.storageQueue('scrapeWorker', {
  queueName: 'scrape-jobs',
  connection: 'AzureWebJobsStorage',
  handler: scrapeWorker,
})
