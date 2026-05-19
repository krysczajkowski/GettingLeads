# GettingLeads

A multi-tenant SaaS that monitors Facebook groups and surfaces relevant leads using AI classification.

## What it does

Users configure which Facebook groups to monitor, describe their offer, and set a daily scrape schedule. The system automatically scrapes those groups, classifies posts with GPT, and presents matching leads in a dashboard — without storing any post content (GDPR compliant).

## Stack

- **Next.js** — web app (landing page, auth, dashboard, settings, billing)
- **Supabase** — database, authentication, row-level security
- **Azure Functions** — background scraping pipeline (separate project in `azure-scraper/`)
- **BrightData** — Facebook group scraping API
- **OpenAI GPT** — lead classification
- **Stripe** — subscriptions and billing

## How the scraping pipeline works

A timer function runs every 5 minutes, checks which users are due for a scrape, and puts one message per user into an **Azure Storage Queue**. A queue-triggered worker picks up each message and runs the full pipeline: scrape via BrightData → filter posts → classify with GPT → save leads to Supabase.

```
Scheduler (every 5 min)
        ↓
Azure Storage Queue
        ↓
     Worker
     ↙    ↘
BrightData  OpenAI
     ↘    ↙
    Supabase
        ↓
    Dashboard
```

## Project structure

```
/                  Next.js app (frontend + API routes)
azure-scraper/     Azure Functions scraping pipeline (separate TS project)
supabase/          Database migrations
```

## Local development

### Next.js app

```bash
npm install
npm run dev
```

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`

### Azure Functions (`azure-scraper/`)

```bash
npx azurite --silent --location .azurite  # start local queue emulator
npm run start
```

Secrets go in `azure-scraper/local.settings.json` (gitignored).

## Database

Run `supabase/migration.sql` in the Supabase SQL Editor before starting the app — tables are not auto-created.
