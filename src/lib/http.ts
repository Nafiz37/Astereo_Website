import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { flattenZodError } from "./validation";
import { rateLimit } from "./rate-limit";
import type { Locale } from "@/i18n/config";
import { translateError } from "@/i18n/errors";
import { hashIp } from "./crypto";

export { hashIp, newToken } from "./crypto";

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? "unknown").trim();
}

export const ok = <T extends object>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, ...data }, init);
export const fail = (status: number, error: string, extra: object = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

/** Rejects cross-site browser POSTs (CSRF defence in depth on top of SameSite cookies). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson<T>(req: Request, schema: ZodType<T>) {
  if (!sameOrigin(req)) return { error: fail(403, "Cross-origin request blocked") } as const;
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 64_000) return { error: fail(413, "Request too large") } as const;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: fail(400, "Invalid JSON body") } as const;
  }
  const parsed = schema.safeParse(raw);
  const lang: Locale = req.headers.get("x-lang") === "bn" ? "bn" : "en";
  if (!parsed.success) return { error: fail(422, translateError("Please check the highlighted fields", lang), { fields: flattenZodError(parsed.error, lang) }) } as const;
  return { data: parsed.data } as const;
}

/** Returns an error response when the caller exceeded `limit` requests per `windowSec`. */
export async function throttle(req: Request, bucket: string, limit: number, windowSec: number) {
  // Reject cross-site posts BEFORE counting them, so a hostile page cannot burn a real visitor's allowance.
  if (!sameOrigin(req)) return fail(403, "Cross-origin request blocked");
  const key = `${bucket}:${hashIp(clientIp(req))}`;
  const res = await rateLimit(key, limit, windowSec);
  if (res.allowed) return null;
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(res.retryAfterSec) } },
  );
}
