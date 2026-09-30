import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { Download } from "lucide-react";
import { getDb, tables } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Subscribers" };
export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db.select().from(tables.subscribers).orderBy(desc(tables.subscribers.createdAt)).limit(500);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Subscribers <span className="text-base font-normal text-muted-foreground">({rows.filter((r) => !r.unsubscribedAt).length} active)</span></h1>
        {/* CSV download from an API route, not a page link */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/export?type=subscribers" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Export CSV</a>
      </div>
      {rows.length === 0 && <p className="surface p-6 text-sm text-muted-foreground">No subscribers yet.</p>}
      <ul className="surface divide-y divide-border">
        {rows.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span>{s.email} <span className="text-xs text-muted-foreground">· {s.source ?? "unknown"}</span></span>
            <span className="text-xs text-muted-foreground">{s.unsubscribedAt ? "unsubscribed" : s.createdAt.toLocaleDateString("en-GB", { timeZone: "UTC" })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
