import { app, InvocationContext } from '@azure/functions'
import { getSupabase } from '../lib/supabase'
import { processUser } from '../lib/pipeline'
import { ScrapeMessage } from '../lib/schedule'

async function scrapeWorker(message: unknown, context: InvocationContext): Promise<void> {
  const msg = message as ScrapeMessage

  if (!msg.userId || !Array.isArray(msg.groups)) {
    context.error('Worker: invalid queue message')
    return
  }

  context.log(`Worker: processing user ${msg.userId} (${msg.groups.length} groups)`)

  const supabase = getSupabase()

  try {
    const result = await processUser(supabase, {
      userId: msg.userId,
      brandName: msg.brandName,
      brandDescription: msg.brandDescription,
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
