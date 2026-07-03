/**
 * Lightweight in-memory rate limiter with sliding window per key.
 *
 * For a single-process Node server (current deployment model) this is
 * sufficient. If we ever scale horizontally we must move the store to Redis
 * — each instance having its own counter is the same as having no limit.
 *
 * Typical use:
 *   const key = clientIp(req) + ":contact";
 *   if (!allow(key, { windowMs: 60_000, max: 5 })) return 429;
 */

type Bucket = { stamps: number[] };
const BUCKETS = new Map<string, Bucket>();
// Coarse GC so the map doesn't grow forever on an attacked endpoint.
let lastGc = 0;

export type RateLimitOpts = {
  windowMs: number;
  max: number;
};

export function allow(key: string, opts: RateLimitOpts): boolean {
  const now = Date.now();
  if (now - lastGc > 60_000) {
    // Drop buckets whose newest entry is older than 5 minutes.
    for (const [k, b] of BUCKETS) {
      if (!b.stamps.length || now - b.stamps[b.stamps.length - 1] > 5 * 60_000) {
        BUCKETS.delete(k);
      }
    }
    lastGc = now;
  }

  const b = BUCKETS.get(key) ?? { stamps: [] };
  const fresh = b.stamps.filter((t) => now - t < opts.windowMs);
  if (fresh.length >= opts.max) {
    BUCKETS.set(key, { stamps: fresh });
    return false;
  }
  fresh.push(now);
  BUCKETS.set(key, { stamps: fresh });
  return true;
}

/**
 * Best-effort client IP. Trusts common proxy headers. For a deploy behind
 * nginx/Caddy/Vercel the x-forwarded-for chain is authoritative.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
