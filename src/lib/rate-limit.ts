type RateLimitEntry = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitEntry>()
let lastCleanupAt = 0

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < 60 * 1000) {
    return
  }

  lastCleanupAt = now

  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now()

  cleanupExpiredBuckets(now)

  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })

    return {
      ok: true,
      retryAfter: 0,
    }
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    }
  }

  current.count += 1

  return {
    ok: true,
    retryAfter: 0,
  }
}
