@AGENTS.md

## Build & Verify
- `npx next build` — run after every change to catch type errors (no test suite yet)
- `npx tsc --project azure-scraper/tsconfig.json --noEmit` — type-check the Azure Functions project

## Codebase Patterns
- No component library — all inline Tailwind utility classes
- Server Components: `await createClient()` from `@/lib/supabase/server`
- Client Components: `createClient()` from `@/lib/supabase/client` (singleton)
- Admin/webhook: `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS)
- API routes that write sensitive profile fields (stripe_customer_id, subscription_status) must use `createAdminClient()` — RLS blocks these writes via the server client
- Mutations: Client Components calling browser Supabase client directly (no Server Actions)
- Auth guard pattern: `supabase.auth.getUser()` → redirect if no user (per-page, and also in layout as defense-in-depth)
- Proxy (`src/proxy.ts`): uses `getClaims()` for local JWT verification (no network call); `getUser()` is only in Server Components
- `@supabase/ssr` v0.10.3+: `setAll(cookiesToSet, headers)` — second `headers` param must be forwarded to response in proxy, ignored in server client
- Subscription gate: `profile.subscription_status !== 'active'` → redirect to `/billing` (per-page)
- Next.js Link prefetch can trigger server-side redirects, causing infinite loops — don't render `<Link>` to gated pages for users who would be redirected

## Azure Scraper (`azure-scraper/`)
- Separate TypeScript project with own `package.json` and `tsconfig.json` — not a monorepo
- Azure Functions v4 model (`app.timer()` registration, `@azure/functions` v4)
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
