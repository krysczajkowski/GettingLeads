const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-5.4-mini'
const MAX_CONTENT_LENGTH = 2_000
const RATE_LIMIT_DELAY_MS = 100

export type ClassificationResult = {
  match: boolean
  score: number
  category: string
  reason_code: string
}

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')
  return key
}

function sanitizePromptInput(value: string, maxLength: number): string {
  return value.slice(0, maxLength).replace(/[\r\n]+/g, ' ')
}

function buildSystemPrompt(brandName: string, brandDescription: string): string {
  const safeName = sanitizePromptInput(brandName, 100)
  const safeDescription = sanitizePromptInput(brandDescription, 200)

  return [
    `You are a lead classifier for the brand "${safeName}".`,
    safeDescription ? `Brand description: ${safeDescription}` : '',
    'Classify whether the following Facebook post indicates a potential lead for this brand.',
    'Return JSON only: {"match": boolean, "score": number, "category": string, "reason_code": string}.',
    'score is 0.0-1.0. category examples: buying_intent, recommendation_request, problem_report, comparison_shopping.',
    'reason_code examples: explicit_purchase_intent, asking_for_recommendations, expressing_need, comparing_products.',
    'Do not include any post content, author information, quotes, or summaries in your response.',
  ]
    .filter(Boolean)
    .join(' ')
}

export async function classifyPost(
  content: string,
  brandName: string,
  brandDescription: string,
): Promise<ClassificationResult | null> {
  const truncated = content.slice(0, MAX_CONTENT_LENGTH)

  const body = {
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(brandName, brandDescription) },
      { role: 'user', content: truncated },
    ],
  }

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return null
  }

  try {
    const data = await res.json()
    const raw = JSON.parse(data.choices?.[0]?.message?.content ?? '{}')
    return validateResult(raw)
  } catch {
    return null
  }
}

const MAX_FIELD_LENGTH = 64

function validateResult(raw: Record<string, unknown>): ClassificationResult | null {
  if (typeof raw.match !== 'boolean') return null
  if (typeof raw.score !== 'number' || raw.score < 0 || raw.score > 1) return null
  if (typeof raw.category !== 'string' || raw.category.length === 0) return null
  if (typeof raw.reason_code !== 'string' || raw.reason_code.length === 0) return null

  return {
    match: raw.match,
    score: raw.score,
    category: raw.category.slice(0, MAX_FIELD_LENGTH),
    reason_code: raw.reason_code.slice(0, MAX_FIELD_LENGTH),
  }
}

export async function rateLimitDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
}
