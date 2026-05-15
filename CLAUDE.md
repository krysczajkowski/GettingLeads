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
- Auth pages (`(auth)/login`, `(auth)/signup`) use split-screen layout — form left, branded aside right; shared components `auth-aside.tsx` and `auth-icons.tsx` live in `(auth)/`; breakpoint is `min-[961px]` (960px), different from both landing and dashboard
- Custom checkbox checkmark (`.auth-check-input` in `globals.css`) needed because Tailwind `appearance-none` removes native checkbox styling — can't do the `:checked::after` pseudo-element with utility classes alone
- Server Components: `await createClient()` from `@/lib/supabase/server`
- Client Components: `createClient()` from `@/lib/supabase/client` (singleton)
- Admin/webhook: `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS)
- API routes that write sensitive profile fields (stripe_customer_id, subscription_status) must use `createAdminClient()` — RLS blocks these writes via the server client
- Rate limiting: `rateLimit(key, maxRequests, windowMs)` from `@/lib/rate-limit.ts` — in-memory, used on Stripe API routes
- Mutations: Client Components calling browser Supabase client directly (no Server Actions)
- Auth guard pattern: `supabase.auth.getUser()` → redirect if no user (per-page, and also in layout as defense-in-depth)
- Proxy (`src/proxy.ts`): uses `getClaims()` for local JWT verification (no network call); `getUser()` is only in Server Components
- `@supabase/ssr` v0.10.3+: `setAll(cookiesToSet, headers)` — second `headers` param must be forwarded to response in proxy, ignored in server client
- Subscription gate: `profile.subscription_status !== 'active'` → redirect to `/billing` (per-page)
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

## GDPR (applies everywhere, especially azure-scraper)
- Post content and author data must NEVER be stored (DB, logs, cache, error messages)
- Allowed to store: post_url, source_url, score, category, reason_code, content_hash, detected_at, expires_at
- Content exists only in local variables during processing, discarded immediately after use
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
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Local Stripe webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- `azure-scraper/local.settings.json` is gitignored — holds secrets for local dev
- `supabase/migration.sql` sections 7+8 add per-user scheduling columns — must be run before scheduler works
- Azure Storage Queue `scrape-jobs` must exist in `gettingleadsstorage` (runtime usually auto-creates on first deploy)
- Local Azure Functions testing requires Azurite: `npx azurite --silent --location .azurite`
- `computeNextScrapeAt` handles half-hour timezones (Asia/Kolkata UTC+5:30) — uses minute-precision offset calculation
- `computeNextScrapeAt` is duplicated in `settings/schedule-form.tsx` (client) and `azure-scraper/src/lib/schedule.ts` (server) — must be kept in sync manually
- Settings page (`/settings`) Supabase `select` must match actual DB columns — a missing column returns null profile, which triggers the subscription gate redirect to `/billing`
- Never show Supabase `error.message` to users in Client Components — use generic error strings (GDPR). This includes auth errors (login/signup) to prevent user enumeration
- Never log raw Supabase `error.message` server-side either — log `error.code` only
- Security headers (X-Frame-Options, HSTS, etc.) are configured in `next.config.ts` `headers()` — don't remove
- `tsc` doesn't delete stale files from `dist/` — always `rm -rf dist` before building azure-scraper (the `prebuild` script handles this)
