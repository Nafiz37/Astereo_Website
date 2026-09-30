import { z } from "zod";
import { adminConfigured, createSession, verifyAdmin } from "@/lib/auth";
import { fail, ok, readJson, throttle } from "@/lib/http";

export const runtime = "nodejs";
const schema = z.object({ email: z.string().max(254), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const limited = await throttle(req, "admin-login", 8, 900);
  if (limited) return limited;
  if (!adminConfigured()) return fail(503, "Admin is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH.");
  const parsed = await readJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const valid = await verifyAdmin(parsed.data.email, parsed.data.password);
  if (!valid) return fail(401, "Invalid email or password.");
  await createSession(parsed.data.email.trim().toLowerCase());
  return ok({});
}
