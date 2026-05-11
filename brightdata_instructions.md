# Fetching Facebook Group Posts with BrightData

Use the BrightData Datasets API (dataset ID: `gd_lz11l67o2cb3r0lkj3` — "Facebook Groups Scraper"). The flow is asynchronous with three steps.

## Step 1 — Trigger the scrape

POST to `https://api.brightdata.com/datasets/v3/scrape` with query params `dataset_id=gd_lz11l67o2cb3r0lkj3&include_errors=true`.

Auth header: `Authorization: Bearer <BRIGHTDATA_API_KEY>`

Request body — a JSON object with an `input` array, one entry per group:
```json
{
  "input": [
    { "url": "https://www.facebook.com/groups/...", "start_date": "YYYY-MM-DD", "end_date": "", "user_to_not_include": "" }
  ]
}
```

`start_date` is the lookback cutoff date (e.g. yesterday for a 24h window). Do not retry this request — re-triggering creates duplicate scrape jobs.

The response is either:
- A JSON array of posts (instant mode), or
- `{ "snapshot_id": "..." }` — use this ID for the next steps.

## Step 2 — Poll for completion

GET `https://api.brightdata.com/datasets/v3/progress/{snapshot_id}` every 15 seconds. Check the `status` field:
- `running` — keep polling
- `ready` — proceed to download
- `failed` / `canceled` — abort with error

Timeout after ~45 minutes (180 polls × 15s).

## Step 3 — Download results

GET `https://api.brightdata.com/datasets/v3/snapshot/{snapshot_id}?format=json`

Returns a JSON array of post objects. Relevant fields per post: `date_posted`, `content`, `url`, `group_name`, `group_url`, `user_username_raw`.

## Post-download filtering

BrightData's `start_date` is approximate, so filter client-side:
- Parse `date_posted` as ISO 8601 (assume UTC if no timezone).
- Discard posts older than the lookback window.
- Discard posts with fewer than 10 characters of content.
- Apply per-group `max_posts` limits by counting posts per `group_url` and discarding the tail.
