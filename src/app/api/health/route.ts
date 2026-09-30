import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { emailProvider } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const provider = emailProvider();
  const checks = { database: false, ai: Boolean(process.env.GEMINI_API_KEY), email: provider !== "none", emailProvider: provider, admin: Boolean(process.env.ADMIN_EMAIL) };
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    checks.database = true;
  } catch {
    /* reported below */
  }
  return NextResponse.json({ ok: checks.database, ...checks }, { status: checks.database ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
