# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Verify

- `npm run build` — compile TypeScript to `dist/` (runs `tsc`)
- `npx tsc --noEmit` — type-check without emitting
- `npm run start` — build + run locally with Azure Functions Core Tools (`func start`)
- `local.settings.json` holds secrets for local dev (gitignored)

## Local Testing

- Requires Azurite for queue support: `npx azurite --silent --location .azurite`
- Start Azurite first, then `npm run start` — both `scheduler` and `scrapeWorker` should appear in function list
- Verify registered functions: `curl -s http://localhost:7071/admin/functions`
- `AzureWebJobsStorage: "UseDevelopmentStorage=true"` in `local.settings.json` connects to Azurite
- Queue config in `host.json`: `batchSize: 1` (one user per worker), `visibilityTimeout: 00:12:00`, `maxDequeueCount: 3`

## Architecture

Azure Functions v4 Node.js project that scrapes Facebook groups for leads. Uses a scheduler + queue architecture: a timer checks every 5 minutes for users due for a scrape, enqueues one Azure Storage Queue message per user, and a queue-triggered worker processes each user independently in parallel. Separate project from the parent Next.js app — own `package.json`, `tsconfig.json`, not a monorepo.

**Scheduling flow** (`scheduler` → Azure Storage Queue → `scrapeWorker`):
1. Scheduler queries `profiles` for users where `next_scrape_at <= now()` and lock is clear (paused users have null `next_scrape_at`, never matched)
2. Atomically sets `scrape_lock_until` (15 min TTL) and advances `next_scrape_at`
3. Enqueues a `ScrapeMessage` per user to the `scrape-jobs` queue
4. Worker picks up one message, calls `processUser()`, clears the lock on completion

**Pipeline flow** (`processUser`):
1. Check trial expiry and trial post cap (200 lifetime for trialing users), then monthly usage limit (5,000 posts/month)
2. Scrape groups via BrightData API (trigger → poll → download)
3. Filter posts by date and minimum content length
4. Classify each post with OpenAI (is it a lead?)
5. Deduplicate by content_hash, insert leads into Supabase
6. Update usage counters, trial_posts_used (for trialing users), and scrape logs

**Key modules:**
- `src/index.ts` — barrel entry point, imports all function registrations
- `src/functions/scheduler.ts` — 5-min timer, queries due users, enqueues to Storage Queue
- `src/functions/scrapeWorker.ts` — queue trigger, processes one user per message
- `src/lib/pipeline.ts` — orchestration, usage tracking, scrape logging
- `src/lib/schedule.ts` — `computeNextScrapeAt`, `parseDays`, `ScrapeMessage` types
- `src/lib/brightdata.ts` — BrightData scrape API (trigger/poll/download), URL validation
- `src/lib/classifier.ts` — OpenAI GPT classification, result validation
- `src/lib/supabase.ts` — lazy singleton Supabase client (service role)

## Patterns

- All external API calls use plain `fetch` — no SDK dependencies for BrightData or OpenAI
- Supabase: `getSupabase()` lazy singleton, service role key (no cookies, no RLS)
- Error handling: error codes only in logs/DB, never interpolate `error.message` (GDPR)
- `.maybeSingle()` not `.single()` for existence checks (avoids PGRST116)
- GPT classification outputs capped at 64 chars per field to prevent content leakage
- Queue messages validated with `isValidMessage()` type guard in `scrapeWorker.ts` — reject malformed messages before processing
- Imports use no `.js` extensions (CommonJS module resolution)

## GDPR Constraints (non-negotiable)

- Post content and author data must NEVER be stored (DB, logs, cache, error messages)
- Allowed to store: post_url, source_url, score, category, reason_code, content_hash, detected_at, expires_at
- Content exists only in local variables during processing, discarded immediately

## Classifier Columns on `profiles`

- `brand_name` (text) — brand identity for the GPT system prompt
- `offer` (text) — "What do you offer?" — feeds GPT as "They offer: {offer}"
- `target_posts` (text) — "What posts should we find?" — feeds GPT as "Find posts where: {targetPosts}"
- Both sanitized to 200 chars max by `sanitizePromptInput` in `classifier.ts`
- Migration: section 9 in `supabase/migration.sql`

## Schedule Columns on `profiles`

- `scrape_hour` (int, default 6) — hour in user's timezone (0-23)
- `scrape_timezone` (text, default 'UTC') — IANA timezone name
- `scrape_days` (text, default '0,1,2,3,4,5,6') — comma-separated day numbers (0=Mon, 6=Sun); empty string = paused
- `next_scrape_at` (timestamptz, nullable) — scheduler polls `WHERE next_scrape_at <= now()`; null = paused
- `scrape_lock_until` (timestamptz) — 15-min TTL lock, prevents double-enqueue, self-heals on worker crash
- Migration: sections 7+8 in `supabase/migration.sql` — run in Supabase SQL Editor

## Trial Columns on `profiles`

- `trial_ends_at` (timestamptz, nullable) — set to `now() + 7 days` by `handle_new_user()` trigger
- `trial_posts_used` (integer, default 0) — lifetime counter, incremented by `incrementTrialUsage` in pipeline.ts
- `TRIAL_POST_CAP = 200` in pipeline.ts — must match `src/lib/subscription.ts` in the Next.js project
- Migration: section 10 in `supabase/migration.sql`

## TypeScript Config

- `module: "commonjs"`, `moduleResolution: "node"` — required for Azure Functions v4 runtime
- Do NOT use `module: "nodenext"` — Azure Functions worker fails to load entry points compiled under nodenext
- Do NOT add `.js` extensions to imports — CJS resolution doesn't need them

## Deployment

### Infrastructure
- **Function App:** `getting-leads-scraper` in resource group `GettingLeads-rg`
- **Storage:** `gettingleadsstorage`
- **Region:** westeurope
- **Plan:** Linux Consumption
- **Runtime:** Node 22 LTS, Functions v4
- **Auth:** OIDC / User-assigned identity (RBAC)

### CI/CD
- GitHub Actions workflow: `.github/workflows/main_getting-leads-scraper.yml`
- Deploys via `func azure functionapp publish --javascript` (not `Azure/functions-action`)
- Build step must `rm -rf dist` before `tsc` — TypeScript compiler doesn't clean stale outputs
- `npm prune --production` before zipping excludes devDependencies
- Artifact excludes `src/`, `tsconfig.json`, `.git/`

### Environment Variables (set in Azure Portal)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BRIGHTDATA_API_KEY`, `OPENAI_API_KEY`, `FUNCTIONS_NODE_BLOCK_ON_ENTRY_POINT_ERROR=true`

### Gotchas
- Azure Functions v4 supports Node 18, 20, 22 — not Node 24 (sync triggers fail silently)
- Node version must match between workflow `NODE_VERSION` and Azure Portal Stack Settings
- `Azure/functions-action@v1` doesn't work with RBAC + Linux Consumption (use `func` CLI instead)
