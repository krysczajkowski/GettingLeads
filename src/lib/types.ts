export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'

export type Profile = {
  id: string
  email: string
  stripe_customer_id: string | null
  subscription_status: SubscriptionStatus
  subscription_id: string | null
  brand_name: string | null
  brand_description: string | null
  retention_days: number
  scrape_hour: number
  scrape_timezone: string
  scrape_frequency: 'daily' | 'every_12h' | 'every_6h'
  next_scrape_at: string | null
  scrape_lock_until: string | null
  created_at: string
  updated_at: string
}

export type Group = {
  id: string
  user_id: string
  url: string
  name: string | null
  is_active: boolean
  created_at: string
}

export type Lead = {
  id: string
  user_id: string
  post_url: string
  source_url: string
  score: number
  category: string
  reason_code: string
  content_hash: string
  detected_at: string
  expires_at: string
}

export type Usage = {
  id: string
  user_id: string
  month: string
  posts_processed: number
  updated_at: string
}

export type ScrapeLog = {
  id: string
  user_id: string
  snapshot_id: string | null
  status: string
  groups_count: number
  posts_fetched: number
  posts_classified: number
  leads_found: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}
