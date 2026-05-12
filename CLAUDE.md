@AGENTS.md

## Build & Verify
- `npx next build` — run after every change to catch type errors (no test suite yet)
- `npx tsc --project azure-scraper/tsconfig.json --noEmit` — type-check the Azure Functions project

## Codebase Patterns
- No component library — all inline Tailwind utility classes
- Server Components: `await createClient()` from `@/lib/supabase/server`
- Client Components: `createClient()` from `@/lib/supabase/client` (singleton)
- Admin/webhook: `createAdminClient()` from `@/lib/supabase/admin` (service role, bypasses RLS)
- Mutations: Client Components calling browser Supabase client directly (no Server Actions)
- Auth guard pattern: `supabase.auth.getUser()` → redirect if no user (per-page, not in layout)
- Subscription gate: `profile.subscription_status !== 'active'` → redirect to `/billing` (per-page)

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
- Stripe SDK crashes `next build` if instantiated at module level without env vars — use lazy singleton (`getStripe()` in `src/lib/stripe.ts`)
- Cookie-based auth + plain HTML form POSTs = CSRF vulnerable — use fetch-based Client Components for mutations to API routes
- Always scope Supabase deletes to `user_id` for defense in depth (don't rely solely on RLS)
- `azure-scraper/local.settings.json` is gitignored — holds secrets for local dev
