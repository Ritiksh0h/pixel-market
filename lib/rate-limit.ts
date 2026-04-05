/**
 * Simple in-memory rate limiter using sliding window.
 * Works per serverless instance — sufficient for Vercel deployments.
 * For multi-region production, replace with Redis (Upstash).
 */

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 300_000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  window: number;
}

/**
 * Pre-configured limits per action type.
 * Adjust these based on your needs.
 */
export const RATE_LIMITS = {
  like: { limit: 30, window: 60 },         // 30 likes per minute
  comment: { limit: 10, window: 60 },      // 10 comments per minute
  upload: { limit: 5, window: 300 },        // 5 uploads per 5 minutes
  follow: { limit: 20, window: 60 },        // 20 follows per minute
  bid: { limit: 10, window: 60 },           // 10 bids per minute
  search: { limit: 30, window: 60 },        // 30 searches per minute
  auth: { limit: 5, window: 300 },          // 5 auth attempts per 5 minutes
  collection: { limit: 20, window: 60 },    // 20 collection ops per minute
  general: { limit: 60, window: 60 },       // 60 requests per minute default
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Check rate limit for a given user + action.
 * Returns { success: true } if allowed, { success: false, retryAfter } if blocked.
 */
export function checkRateLimit(
  userId: string,
  action: RateLimitAction
): { success: true } | { success: false; retryAfter: number } {
  const config = RATE_LIMITS[action];
  const key = `${action}:${userId}`;
  const now = Date.now();
  const windowMs = config.window * 1000;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.limit) {
    // Calculate when the oldest request in window expires
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return { success: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { success: true };
}

/**
 * Helper to use in server actions.
 * Returns an error object if rate limited, null if OK.
 */
export function rateLimit(
  userId: string | undefined,
  action: RateLimitAction
): { error: string } | null {
  if (!userId) return null; // Skip for unauthenticated (auth actions handle separately)

  const result = checkRateLimit(userId, action);
  if (!result.success) {
    return { error: `Too many requests. Please wait ${result.retryAfter}s and try again.` };
  }
  return null;
}
