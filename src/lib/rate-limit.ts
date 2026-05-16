import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function rateLimit(key: string, maxRequests: number, windowMs: number): Promise<{ ok: boolean; remaining: number }> {
  try {
    const windowSec = Math.ceil(windowMs / 1000);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec);
    }
    return { ok: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
  } catch {
    console.error('[rate-limit] Redis unavailable, failing open');
    return { ok: true, remaining: maxRequests };
  }
}

export function rateLimitResponse() {
  return Response.json(
    { success: false, message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
    { status: 429 },
  );
}
