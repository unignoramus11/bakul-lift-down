import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Per-device daily report cap, enforced with Upstash Redis (serverless-friendly).
// We key on a client-generated device id — NOT the IP — so the whole college
// NAT isn't throttled as one; each device gets its own allowance. The key also
// includes the IST day, so the count resets at IST midnight and every kind of
// report (DOWN + RESTORED) draws from the same 5.

export const MAX_REPORTS_PER_DAY = Number(
  process.env.RATELIMIT_REPORTS_PER_DAY ?? "5",
);

let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN not set — report rate limiting is DISABLED.",
    );
    limiter = null;
    return null;
  }
  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    // One window per (device, IST day); TTL cleans up yesterday's keys.
    limiter: Ratelimit.fixedWindow(MAX_REPORTS_PER_DAY, "1 d"),
    prefix: "bld:reports",
    analytics: false,
  });
  return limiter;
}

export type LimitResult = { ok: boolean; limit: number; remaining: number };

/** Consume one report allowance for a device on a given IST day. */
export async function consumeReportAllowance(
  deviceId: string,
  dateKey: string,
): Promise<LimitResult> {
  const rl = getLimiter();
  // No device id or no Upstash configured → don't block (best-effort limiter).
  if (!rl || !deviceId) {
    return { ok: true, limit: MAX_REPORTS_PER_DAY, remaining: MAX_REPORTS_PER_DAY };
  }
  try {
    const { success, limit, remaining } = await rl.limit(`${deviceId}:${dateKey}`);
    return { ok: success, limit, remaining };
  } catch (err) {
    // Never let a limiter outage block legitimate reports.
    console.error("[ratelimit] limiter error, allowing report:", err);
    return { ok: true, limit: MAX_REPORTS_PER_DAY, remaining: MAX_REPORTS_PER_DAY };
  }
}
