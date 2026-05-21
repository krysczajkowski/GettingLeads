@AGENTS.md

## Build & Verify
- `npx next build` — run after every change to catch type errors (no test suite yet)
- `npx tsc --project azure-scraper/tsconfig.json --noEmit` — type-check the Azure Functions project

## Codebase Patterns
- No component library — all inline Tailwind utility classes
- Tailwind CSS v4 — no `tailwind.config.ts`; all theme tokens (colors, shadows, radii, fonts, keyframes) live in `globals.css` `@theme inline {}` block
- Landing page (`src/app/page.tsx`) is responsive mobile-first — `md:` (768px) is the primary layout breakpoint
- `src/app/components/nav.tsx` is the only client component in the landing page shell (hamburger menu state)
- App shell (`(app)/layout.tsx`) is responsive — sidebar hidden below `md:`, mobile top bar nav via `(app)/components/mobile-nav.tsx`
- App shell breakpoint strategy differs from landing page: sidebar (232px) reduces content width, so dashboard dense layouts (stat grid, table columns) use `xl:` (1280px) not `md:`
- Auth pages (`(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`, `(auth)/reset-password`) use split-screen layout — form left, branded aside right; shared components `auth-aside.tsx`, `auth-icons.tsx`, and `strength-meter.tsx` live in `(auth)/`; breakpoint is `min-[961px]` (960px), different from both landing and dashboard
- Custom checkbox checkmark (`.auth-check-input` in `globals.css`) needed because Tailwind `appearance-none` removes native checkbox styling — can't do the `:checked::after` pseudo-element with utility classes alone
- Server Components: `await createClient()` from `@/lib/supabase/server`
- Client Components: `createClient()` from `@/lib/supabase/client` (singleton)
- Admin/webhook: `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS)
- API routes that write sensitive profile fields (stripe_customer_id, subscription_status) must use `createAdminClient()` — RLS blocks these writes via the server client
- Rate limiting: `rateLimit(key, maxRequests, windowMs)` from `@/lib/rate-limit.ts` — in-memory, used on Stripe and account API routes
- Mutations: Client Components calling browser Supabase client directly (no Server Actions), except schedule updates which use `POST /api/schedule` (server-side computation of `next_scrape_at`)
- Manual scrape: `POST /api/scrape-now` sets `next_scrape_at = now()` so scheduler picks it up; `GET /api/scrape-now` returns lock status for polling; rate limited to 1 per 15 min per user
- `scrape-now-button.tsx` uses phase state machine (idle → queued → scraping → done) with 5s poll interval on lock status
- Forgot password uses a two-step pattern: client calls `POST /api/auth/forgot-password` (rate-limited by IP) first, then calls `supabase.auth.resetPasswordForEmail` only if rate check passes
- Password reset flow: `resetPasswordForEmail` → `/callback?next=/reset-password` → callback route reads `next` param and redirects; only `/reset-password` is allowed as `next` value (prevent open redirect)
- Supabase auth `emailRedirectTo` must use `process.env.NEXT_PUBLIC_APP_URL`, not `window.location.origin` — origin can be spoofed in emails
- Auth guard pattern: `supabase.auth.getUser()` → redirect if no user (per-page, and also in layout as defense-in-depth)
- Transactional emails (signup confirmation, password reset) sent via Resend SMTP — configured in Supabase Dashboard (Authentication → SMTP Settings), templates editable in Authentication → Email Templates
- Proxy (`src/proxy.ts`): uses `getClaims()` for local JWT verification (no network call); `getUser()` is only in Server Components
- `@supabase/ssr` v0.10.3+: `setAll(cookiesToSet, headers)` — second `headers` param must be forwarded to response in proxy, ignored in server client
- Subscription gate: `canAccessApp(status)` from `@/lib/subscription.ts` — returns true for `'active'` and `'trialing'`; used in `(app)/layout.tsx` (nav visibility + trial expiry flip) and per-page in dashboard/settings
- `/account` page intentionally has NO subscription gate — GDPR rights (data export, account deletion) must remain accessible regardless of subscription status
- Onboarding gate: `brand_name` being null = onboarding incomplete; dashboard redirects to `/onboarding`; layout hides Dashboard nav link until `brand_name` is set (prevents `<Link>` prefetch redirect loop)
- Form components (`brand-form.tsx`, `schedule-form.tsx`) accept optional `onSuccessHref?: string` — when provided, `router.push()` to that URL on save instead of showing "Saved" flash; used by onboarding, ignored by settings
- Trial expiry auto-flip lives in `(app)/layout.tsx` only — uses `createAdminClient()` with `.eq('subscription_status', 'trialing')` guard to avoid overwriting Stripe webhook writes
- `TRIAL_POST_CAP = 200` is duplicated in `src/lib/subscription.ts` (Next.js) and `azure-scraper/src/lib/pipeline.ts` (Azure) — must be kept in sync manually (separate TS projects, can't share)
- Next.js Link prefetch can trigger server-side redirects, causing infinite loops — don't render `<Link>` to gated pages for users who would be redirected

## Azure Scraper (`azure-scraper/`)
- Separate TypeScript project with own `package.json` and `tsconfig.json` — not a monorepo
- Azure Functions v4 model — scheduler + queue architecture (`app.timer()` + `app.storageQueue()`)
- Scheduler (5-min timer) checks `profiles.next_scrape_at`, enqueues to Azure Storage Queue `scrape-jobs`
- Worker (queue trigger) processes one user per message via `processUser()` — parallel, isolated
- Double-scrape prevention: `profiles.scrape_lock_until` column (15-min TTL, self-healing)
- Per-user schedule: `profiles.scrape_hour/scrape_timezone/scrape_days` — UI on `/settings`; `scrape_days` is comma-separated day numbers (0=Mon, 6=Sun), empty = paused
- Barrel entry point `src/index.ts` imports all function registrations — `package.json` `"main"` points to `dist/index.js`
- Supabase: `getSupabase()` lazy singleton using service role key (no cookies)
- BrightData + OpenAI: plain `fetch` calls, no SDK dependencies
- Error codes only in logs/DB — never interpolate `error.message` (GDPR: could leak post content)
- `.maybeSingle()` not `.single()` for existence checks (avoids PGRST116 errors)
- GPT classification outputs capped at 64 chars per field to prevent content leakage
- Classifier prompt uses `profiles.offer` ("They offer: X") and `profiles.target_posts` ("Find posts where: Y") — sanitized to 200 chars each; UI `maxLength` matches

## GDPR (applies everywhere, especially azure-scraper)
- Post content and author data must NEVER be stored (DB, logs, cache, error messages)
- Allowed to store: post_url, source_url, score, category, reason_code, content_hash, detected_at, expires_at
- Content exists only in local variables during processing, discarded immediately after use
- Account deletion: `admin.auth.admin.deleteUser()` cascades through `auth.users → profiles → groups, leads, usage, scrape_logs`; Stripe subscription must be canceled BEFORE deleting the user (otherwise the subscription keeps billing with no user to dispute)
- See `gdpr_rules.md` for full rules — these are non-negotiable constraints

## Gotchas
- Next.js 16 renamed `middleware.ts` to `proxy.ts` (export `proxy` not `middleware`) — read `node_modules/next/dist/docs/` before touching it
- Stripe SDK crashes `next build` if instantiated at module level without env vars — use lazy singleton (`getStripe()` in `src/lib/stripe.ts`)
- Cookie-based auth + plain HTML form POSTs = CSRF vulnerable — use fetch-based Client Components for mutations to API routes
- Always scope Supabase deletes to `user_id` for defense in depth (don't rely solely on RLS)
- Same for client-side reads — always add `.eq('user_id', ...)` even though RLS should filter
- Validate URL protocol (http/https only) before rendering as `href` — scraped URLs like `post_url` could contain `javascript:` URIs
- `supabase/migration.sql` must be run in Supabase SQL Editor before the app works — tables don't auto-create
- pg_cron extension must be manually enabled in Supabase Dashboard before the cleanup job can be scheduled
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Local Stripe webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- `azure-scraper/local.settings.json` is gitignored — holds secrets for local dev
- `supabase/migration.sql` sections 7+8 add per-user scheduling columns, section 9 replaces `brand_description` with `offer` + `target_posts` — must be run before scheduler works
- `supabase/migration.sql` section 10 adds free trial columns (`trial_ends_at`, `trial_posts_used`) and updates `handle_new_user()` trigger — must be run before trial feature works
- Partial index `idx_profiles_next_scrape` covers `subscription_status in ('active', 'trialing')` — must be updated if new statuses need scraping
- Azure Storage Queue `scrape-jobs` must exist in `gettingleadsstorage` (runtime usually auto-creates on first deploy)
- Local Azure Functions testing requires Azurite: `npx azurite --silent --location .azurite`
- `computeNextScrapeAt` handles half-hour timezones (Asia/Kolkata UTC+5:30) — uses minute-precision offset calculation
- `computeNextScrapeAt` is duplicated in `src/app/api/schedule/route.ts` (Next.js) and `azure-scraper/src/lib/schedule.ts` (Azure) — must be kept in sync manually
- Settings page (`/settings`) Supabase `select` must match actual DB columns — a missing column returns null profile, which triggers the subscription gate redirect to `/billing`
- Never show Supabase `error.message` to users in Client Components — use generic error strings (GDPR)
- Never log raw Supabase `error.message` server-side either — log `error.code` only
- Don't interpolate Stripe SDK error `.message` in logs either — can contain customer email/name
- Signup duplicate-email: we chose explicit UX over anti-enumeration — show "account already exists" when Supabase returns empty `identities` array (deliberate tradeoff: B2B SaaS where UX matters more than hiding registrations)
- Security headers (X-Frame-Options, HSTS, etc.) are configured in `next.config.ts` `headers()` — don't remove
- `tsc` doesn't delete stale files from `dist/` — always `rm -rf dist` before building azure-scraper (the `prebuild` script handles this)
- When adding new protected routes under `(app)/`, also add them to `isProtectedRoute` in `proxy.ts` — otherwise unauthenticated users won't be redirected to `/login`
- When adding new auth routes under `(auth)/`, also add them to `isAuthRoute` in `proxy.ts` — otherwise authenticated users won't be redirected away from the auth page
- `supabase/migration.sql` section 11 adds `protect_subscription_fields` trigger — silently reverts `subscription_status`, `subscription_id`, `stripe_customer_id`, `trial_ends_at`, `trial_posts_used`, `email` on non-service_role updates
