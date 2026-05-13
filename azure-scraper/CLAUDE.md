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
1. Scheduler queries `profiles` for users where `next_scrape_at <= now()` and lock is clear
2. Atomically sets `scrape_lock_until` (15 min TTL) and advances `next_scrape_at`
3. Enqueues a `ScrapeMessage` per user to the `scrape-jobs` queue
4. Worker picks up one message, calls `processUser()`, clears the lock on completion

**Pipeline flow** (`processUser` — unchanged):
1. Check monthly usage limit (5,000 posts/month per user)
2. Scrape groups via BrightData API (trigger → poll → download)
3. Filter posts by date and minimum content length
4. Classify each post with OpenAI (is it a lead?)
5. Deduplicate by content_hash, insert leads into Supabase
6. Update usage counters and scrape logs

**Key modules:**
- `src/index.ts` — barrel entry point, imports all function registrations
- `src/functions/scheduler.ts` — 5-min timer, queries due users, enqueues to Storage Queue
- `src/functions/scrapeWorker.ts` — queue trigger, processes one user per message
- `src/lib/pipeline.ts` — orchestration, usage tracking, scrape logging
- `src/lib/schedule.ts` — `computeNextScrapeAt`, `ScrapeFrequency`, `ScrapeMessage` types
- `src/lib/brightdata.ts` — BrightData scrape API (trigger/poll/download), URL validation
- `src/lib/classifier.ts` — OpenAI GPT classification, result validation
- `src/lib/supabase.ts` — lazy singleton Supabase client (service role)

## Patterns

- All external API calls use plain `fetch` — no SDK dependencies for BrightData or OpenAI
- Supabase: `getSupabase()` lazy singleton, service role key (no cookies, no RLS)
- Error handling: error codes only in logs/DB, never interpolate `error.message` (GDPR)
- `.maybeSingle()` not `.single()` for existence checks (avoids PGRST116)
- GPT classification outputs capped at 64 chars per field to prevent content leakage
- Imports use no `.js` extensions (CommonJS module resolution)

## GDPR Constraints (non-negotiable)

- Post content and author data must NEVER be stored (DB, logs, cache, error messages)
- Allowed to store: post_url, source_url, score, category, reason_code, content_hash, detected_at, expires_at
- Content exists only in local variables during processing, discarded immediately

## Schedule Columns on `profiles`

- `scrape_hour` (int, default 6) — hour in user's timezone (0-23)
- `scrape_timezone` (text, default 'UTC') — IANA timezone name
- `scrape_frequency` (text, default 'daily') — `daily` | `every_12h` | `every_6h`
- `next_scrape_at` (timestamptz) — scheduler polls `WHERE next_scrape_at <= now()`
- `scrape_lock_until` (timestamptz) — 15-min TTL lock, prevents double-enqueue, self-heals on worker crash
- Migration: section 7 in `supabase/migration.sql` — run in Supabase SQL Editor

## TypeScript Config

- `module: "commonjs"`, `moduleResolution: "node"` — required for Azure Functions v4 runtime
- Do NOT use `module: "nodenext"` — Azure Functions worker fails to load entry points compiled under nodenext
- Do NOT add `.js` extensions to imports — CJS resolution doesn't need them

## Deployment (UNRESOLVED — as of 2026-05-12)

### Infrastructure
- **Function App:** `getting-leads-scraper` in resource group `GettingLeads-rg`
- **Storage:** `gettingleadsstorage`
- **Region:** westeurope
- **Plan:** Linux Consumption
- **Runtime:** Node 24, Functions v4
- **Auth:** OIDC / User-assigned identity (RBAC)

### The Deployment Problem
Deploy fails at "Sync Trigger" with: *"Failed to perform sync trigger on function app. Function app may have malformed content."*

Build always succeeds. The code uploads successfully. Azure cannot start the function runtime afterward.

### What Has Been Tried (all failed)
1. `Azure/functions-action@v1` — forces `WEBSITE_RUN_FROM_PACKAGE` on RBAC + Linux Consumption, sync trigger fails (known bug: [Azure/functions-action#147](https://github.com/Azure/functions-action/issues/147))
2. `Azure/functions-action@v1` with `scm-do-build-during-deployment: 'false'` + `enable-oryx-build: 'false'` — same sync trigger failure
3. `az functionapp deployment source config-zip` — returns 503 (SCM/Kudu unavailable on Linux Consumption)
4. `func azure functionapp publish --javascript` — current approach, pending test results
5. Glob `"main": "dist/functions/*.js"` — can silently match zero files ([azure-functions-nodejs-library#119](https://github.com/Azure/azure-functions-nodejs-library/issues/119))
6. Changed tsconfig from `nodenext` to `commonjs` — fixed build issues but didn't fix deploy
7. `npm prune --production` before zip, excluded `src/` from artifact — reduced size but didn't fix deploy

### Likely Root Causes (not yet confirmed)
- RBAC + Linux Consumption combination is buggy for the functions-action
- Azure runtime may fail to cold-start with the deployed package (Node 24 compatibility? dependency issue?)
- Setting `FUNCTIONS_NODE_BLOCK_ON_ENTRY_POINT_ERROR=true` in Function App env vars would surface the real error

### What to Try Next
- Check `func azure functionapp publish --javascript` results (current CI approach)
- If that fails: switch from OIDC to publish profile auth
- If that fails: deploy locally with `func azure functionapp publish` to see actual runtime errors
- Consider whether Node 24 is properly supported by `@azure/functions` v4

### Environment Variables (set in Azure Portal)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BRIGHTDATA_API_KEY`, `OPENAI_API_KEY`

Add `FUNCTIONS_NODE_BLOCK_ON_ENTRY_POINT_ERROR=true` to get real error messages instead of "malformed content."
