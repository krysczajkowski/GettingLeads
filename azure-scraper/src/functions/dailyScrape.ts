import { app, InvocationContext, Timer } from '@azure/functions'
import { getSupabase } from '../lib/supabase.js'
import { fetchActiveUsers, processUser, PipelineResult } from '../lib/pipeline.js'

async function dailyScrape(timer: Timer, context: InvocationContext): Promise<void> {
  if (timer.isPastDue) {
    context.warn('Timer is past due — running anyway')
  }

  context.log('Daily scrape started')

  const supabase = getSupabase()
  const users = await fetchActiveUsers(supabase)

  if (users.length === 0) {
    context.log('No active users with groups — nothing to scrape')
    return
  }

  context.log(`Processing ${users.length} user(s)`)

  const results: PipelineResult[] = []

  for (const user of users) {
    context.log(`Processing user ${user.userId} (${user.groups.length} groups)`)

    const result = await processUser(supabase, user)
    results.push(result)

    if (result.status === 'error') {
      context.error(`User ${user.userId} failed: ${result.errorCode}`)
    } else if (result.status === 'skipped_usage') {
      context.log(`User ${user.userId} skipped — monthly limit reached`)
    } else {
      context.log(
        `User ${user.userId} done — ${result.postsFetched} fetched, ${result.postsFiltered} filtered, ${result.postsClassified} classified, ${result.leadsFound} leads`,
      )
    }
  }

  const succeeded = results.filter((r) => r.status === 'success').length
  const skipped = results.filter((r) => r.status === 'skipped_usage').length
  const failed = results.filter((r) => r.status === 'error').length

  context.log(`Daily scrape complete: ${succeeded} succeeded, ${skipped} skipped, ${failed} failed`)
}

app.timer('dailyScrape', {
  schedule: '0 0 6 * * *',
  handler: dailyScrape,
})
