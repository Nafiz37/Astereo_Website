import { sql } from "drizzle-orm";
import { getDb, tables } from "@/db";

/**
 * Fixed-window rate limiter backed by Postgres (works across serverless instances, no Redis needed).
 * A single atomic UPSERT either starts a new window or increments the current one.
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  try {
    const db = await getDb();
    const resetAt = new Date(Date.now() + windowSec * 1000);
    const [row] = await db
      .insert(tables.rateLimits)
      .values({ key, count: 1, resetAt })
      .onConflictDoUpdate({
        target: tables.rateLimits.key,
        set: {
          count: sql`CASE WHEN ${tables.rateLimits.resetAt} <= now() THEN 1 ELSE ${tables.rateLimits.count} + 1 END`,
          resetAt: sql`CASE WHEN ${tables.rateLimits.resetAt} <= now() THEN ${resetAt.toISOString()}::timestamptz ELSE ${tables.rateLimits.resetAt} END`,
        },
      })
      .returning({ count: tables.rateLimits.count, resetAt: tables.rateLimits.resetAt });

    if (row.count > limit) {
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
    }
    return { allowed: true, retryAfterSec: 0 };
  } catch (err) {
    // Fail open: a limiter outage must not take the contact form down.
    console.error("[rate-limit] error", err);
    return { allowed: true, retryAfterSec: 0 };
  }
}

/** Housekeeping: drop expired windows (called opportunistically). */
export async function pruneRateLimits() {
  const db = await getDb();
  await db.delete(tables.rateLimits).where(sql`${tables.rateLimits.resetAt} < now() - interval '1 day'`);
}
