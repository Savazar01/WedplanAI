import { LRUCache } from 'lru-cache';

type RateLimitTier = 'public' | 'api' | 'authenticated';

const tierConfig: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  public: { limit: 10, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
  authenticated: { limit: 120, windowMs: 60_000 },
};

const caches = new Map<RateLimitTier, LRUCache<string, { count: number; resetTime: number }>>();

function getCache(tier: RateLimitTier) {
  if (!caches.has(tier)) {
    caches.set(
      tier,
      new LRUCache({
        max: 5000,
        ttl: tierConfig[tier].windowMs,
      })
    );
  }
  return caches.get(tier)!;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(key: string, tier: RateLimitTier = 'public'): RateLimitResult {
  const cache = getCache(tier);
  const config = tierConfig[tier];
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    cache.set(key, { count: 1, resetTime });
    return { success: true, limit: config.limit, remaining: config.limit - 1, resetTime };
  }

  entry.count += 1;
  if (entry.count > config.limit) {
    return { success: false, limit: config.limit, remaining: 0, resetTime: entry.resetTime };
  }

  return { success: true, limit: config.limit, remaining: config.limit - entry.count, resetTime: entry.resetTime };
}
