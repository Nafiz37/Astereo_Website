import { desc } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { getAdmin } from "@/lib/auth";
import { fail } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  let s = v instanceof Date ? v.toISOString() : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return fail(401, "Unauthorized");
  const type = new URL(req.url).searchParams.get("type");
  const db = await getDb();
  let rows: Record<string, unknown>[];
  if (type === "subscribers") rows = await db.select().from(tables.subscribers).orderBy(desc(tables.subscribers.createdAt));
  else if (type === "consultations") rows = await db.select().from(tables.consultations).orderBy(desc(tables.consultations.startsAt));
  else rows = await db.select().from(tables.leads).orderBy(desc(tables.leads.createdAt));
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const csv = [headers.map(cell).join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="astareo-${type ?? "leads"}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
