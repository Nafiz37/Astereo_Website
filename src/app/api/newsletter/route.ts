import { getDb, tables } from "@/db";
import { newToken, ok, readJson, throttle } from "@/lib/http";
import { newsletterSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await throttle(req, "newsletter", 5, 600);
  if (limited) return limited;
  const parsed = await readJson(req, newsletterSchema);
  if ("error" in parsed) return parsed.error;
  if (parsed.data.website) return ok({});

  const db = await getDb();
  await db
    .insert(tables.subscribers)
    .values({ email: parsed.data.email, source: parsed.data.source, unsubscribeToken: newToken() })
    .onConflictDoUpdate({ target: tables.subscribers.email, set: { unsubscribedAt: null } });
  return ok({});
}
