export type RateLimitResult =
  | { allowed: true; remaining: number; retryAfterMs: 0 }
  | { allowed: false; remaining: 0; retryAfterMs: number };

type RateLimitEntry = { count: number; windowStartedAt: number };

export function createFixedWindowRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number; now?: () => number }) {
  const entries = new Map<string, RateLimitEntry>();
  const now = options.now ?? (() => Date.now());
  const maxKeys = options.maxKeys ?? 10_000;

  function trimOldestEntry() {
    if (entries.size < maxKeys) return;
    let oldestKey: string | undefined;
    let oldestAt = Number.POSITIVE_INFINITY;
    for (const [key, entry] of entries) {
      if (entry.windowStartedAt < oldestAt) {
        oldestAt = entry.windowStartedAt;
        oldestKey = key;
      }
    }
    if (oldestKey) entries.delete(oldestKey);
  }

  return {
    consume(key: string): RateLimitResult {
      const timestamp = now();
      const existing = entries.get(key);
      if (!existing || timestamp - existing.windowStartedAt >= options.windowMs) {
        trimOldestEntry();
        entries.set(key, { count: 1, windowStartedAt: timestamp });
        return { allowed: true, remaining: options.limit - 1, retryAfterMs: 0 };
      }
      if (existing.count >= options.limit) {
        return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, options.windowMs - (timestamp - existing.windowStartedAt)) };
      }
      existing.count += 1;
      return { allowed: true, remaining: options.limit - existing.count, retryAfterMs: 0 };
    },
    clear() {
      entries.clear();
    },
  };
}

export const smartDraftGenerationLimiter = createFixedWindowRateLimiter({ limit: 5, windowMs: 60_000 });
