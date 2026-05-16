-- GettingLeads: Full schema migration
-- Run this in the Supabase SQL Editor to set up all tables, RLS, and triggers.

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  subscription_status text not null default 'inactive',
  subscription_id text,
  brand_name text,
  offer text,
  target_posts text,
  retention_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. groups
-- ============================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

create policy "Users can read own groups"
  on groups for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own groups"
  on groups for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own groups"
  on groups for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own groups"
  on groups for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 3. leads (GDPR-compliant: no post content or author data)
-- ============================================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_url text not null,
  source_url text not null,
  score real not null,
  category text not null,
  reason_code text not null,
  content_hash text not null,
  detected_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_leads_user_detected on leads(user_id, detected_at desc);
create unique index idx_leads_dedup on leads(user_id, content_hash);

alter table public.leads enable row level security;

create policy "Users can read own leads"
  on leads for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 4. usage
-- ============================================================
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  posts_processed integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, month)
);

alter table public.usage enable row level security;

create policy "Users can read own usage"
  on usage for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 5. scrape_logs
-- ============================================================
create table public.scrape_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_id text,
  status text not null,
  groups_count integer not null default 0,
  posts_fetched integer not null default 0,
  posts_classified integer not null default 0,
  leads_found integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.scrape_logs enable row level security;

create policy "Users can read own scrape logs"
  on scrape_logs for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- 6. Scheduled cleanup: delete expired leads daily at 2 AM UTC
-- ============================================================
-- Requires pg_cron extension (enabled by default on Supabase).
-- select cron.schedule(
--   'delete-expired-leads',
--   '0 2 * * *',
--   $$delete from public.leads where expires_at < now()$$
-- );

-- ============================================================
-- 7. Per-user scrape scheduling
-- ============================================================
alter table public.profiles
  add column if not exists scrape_hour integer not null default 6,
  add column if not exists scrape_timezone text not null default 'UTC',
  add column if not exists scrape_frequency text not null default 'daily',
  add column if not exists next_scrape_at timestamptz,
  add column if not exists scrape_lock_until timestamptz;

-- Back-fill existing users: set to now() so the scheduler picks them up
-- on the next tick and computes the correct timezone-aware next_scrape_at.
update public.profiles
set next_scrape_at = now()
where next_scrape_at is null;

-- Partial index for the scheduler's polling query.
create index if not exists idx_profiles_next_scrape
  on public.profiles (next_scrape_at)
  where subscription_status = 'active';

-- ============================================================
-- 8. Replace scrape_frequency with scrape_days
-- ============================================================
alter table public.profiles
  add column if not exists scrape_days text not null default '0,1,2,3,4,5,6';

-- Back-fill: all existing users get every day selected
update public.profiles
set scrape_days = '0,1,2,3,4,5,6'
where scrape_days = '';

-- Drop the old frequency column (deploy code changes first)
alter table public.profiles
  drop column if exists scrape_frequency;

-- ============================================================
-- 9. Replace brand_description with offer + target_posts
-- ============================================================
alter table public.profiles
  add column if not exists offer text,
  add column if not exists target_posts text;

alter table public.profiles
  drop column if exists brand_description;

-- ============================================================
-- 10. Free trial
-- ============================================================
alter table public.profiles
  add column if not exists trial_ends_at timestamptz,
  add column if not exists trial_posts_used integer not null default 0;

-- Backfill: existing inactive users get a fresh 7-day trial
update public.profiles
set
  subscription_status = 'trialing',
  trial_ends_at       = now() + interval '7 days'
where subscription_status = 'inactive';

-- New users: trigger sets trialing + trial_ends_at
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, subscription_status, trial_ends_at)
  values (
    new.id,
    new.email,
    'trialing',
    now() + interval '7 days'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Extend the partial scrape-scheduler index to include trialing users
drop index if exists idx_profiles_next_scrape;
create index idx_profiles_next_scrape
  on public.profiles (next_scrape_at)
  where subscription_status in ('active', 'trialing');
