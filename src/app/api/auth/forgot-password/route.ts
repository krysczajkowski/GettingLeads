import { rateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(`forgot:${ip}`, 3, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  return NextResponse.json({ ok: true })
}
