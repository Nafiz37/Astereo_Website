import { eq } from "drizzle-orm";
import { getDb, tables } from "@/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  let done = false;
  if (token.length > 10) {
    const db = await getDb();
    const rows = await db.update(tables.subscribers).set({ unsubscribedAt: new Date() }).where(eq(tables.subscribers.unsubscribeToken, token)).returning({ id: tables.subscribers.id });
    done = rows.length > 0;
  }
  const msg = done ? "You have been unsubscribed." : "This unsubscribe link is invalid or already used.";
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Unsubscribe</title><body style="font-family:system-ui;background:#0a0f1e;color:#e6edf7;display:grid;place-items:center;min-height:100vh;margin:0"><div style="text-align:center"><h1>${msg}</h1><a style="color:#60a5fa" href="/">Back to Astareo</a></div></body>`, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
