interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

const WINDOW_MS = 60_000
const MAX_REQUESTS = 20

export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  return `rl:${ip}`
}

export function checkRateLimit(key: string): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: now + WINDOW_MS }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetTime: entry.resetTime }
}
