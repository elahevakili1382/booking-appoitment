/**
 * محدودیت تعداد درخواست — در حافظه‌ی همین instance.
 * با restart ریست می‌شود و بین چند instance مشترک نیست.
 * IP فقط از اتصال واقعی خوانده می‌شود؛ X-Forwarded-For فقط با LUMINA_TRUST_PROXY=1 معتبر است.
 */
import type { H3Event } from 'h3'

const buckets = new Map<string, number[]>()
let lastSweep = Date.now()

function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, hits] of buckets) {
    if (!hits.length || now - hits[hits.length - 1]! > 3_600_000) buckets.delete(key)
  }
}

export function clientIp(event: H3Event) {
  const trustProxy = process.env.LUMINA_TRUST_PROXY === '1'
  return getRequestIP(event, { xForwardedFor: trustProxy }) || 'unknown'
}

export function rateLimit(event: H3Event, key: string, limit: number, windowMs: number) {
  const now = Date.now()
  sweep(now)
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - hits[0]!)) / 1000))
    buckets.set(key, hits)
    setResponseHeader(event, 'Retry-After', retryAfter)
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  hits.push(now)
  buckets.set(key, hits)
}
