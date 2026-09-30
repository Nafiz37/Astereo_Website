import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import { InlineSelect, NotesEditor } from "@/components/admin/inline-select";
import { getDb, tables } from "@/db";
import { LEAD_STATUSES, LEAD_TYPES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; type?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const conds: SQL[] = [];
  if (sp.status && (LEAD_STATUSES as readonly string[]).includes(sp.status)) conds.push(eq(tables.leads.status, sp.status as (typeof LEAD_STATUSES)[number]));
  if (sp.type && (LEAD_TYPES as readonly string[]).includes(sp.type)) conds.push(eq(tables.leads.type, sp.type as (typeof LEAD_TYPES)[number]));
  if (sp.q) {
    const like = `%${sp.q.replace(/[%_]/g, "")}%`;
    conds.push(or(ilike(tables.leads.name, like), ilike(tables.leads.email, like), ilike(tables.leads.company, like))!);
  }
  const db = await getDb();
  const rows = await db.select().from(tables.leads).where(conds.length ? and(...conds) : undefined).orderBy(desc(tables.leads.createdAt)).limit(200);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Leads <span className="text-base font-normal text-muted-foreground">({rows.length})</span></h1>
        {/* CSV download from an API route, not a page link */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/export?type=leads" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Export CSV</a>
      </div>
      <form className="flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search name, email, company…" className="field max-w-xs" aria-label="Search leads" />
        <select name="status" defaultValue={sp.status ?? ""} className="field w-auto" aria-label="Status"><option value="">All statuses</option>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select name="type" defaultValue={sp.type ?? ""} className="field w-auto" aria-label="Type"><option value="">All types</option>{LEAD_TYPES.map((s) => <option key={s}>{s}</option>)}</select>
        <button className="rounded-lg bg-primary px-4 text-sm text-white">Filter</button>
        <Link href="/admin/leads" className="self-center text-xs text-muted-foreground hover:text-foreground">Reset</Link>
      </form>
      {rows.length === 0 && <p className="surface p-6 text-sm text-muted-foreground">No leads match.</p>}
      <ul className="space-y-3">
        {rows.map((l) => (
          <li key={l.id} className="surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{l.name} <span className="text-sm font-normal text-muted-foreground">· {l.company ?? "no company"}</span></p>
                <p className="text-sm"><a href={`mailto:${l.email}`} className="text-primary hover:underline">{l.email}</a>{l.phone && <> · <a href={`tel:${l.phone}`} className="hover:underline">{l.phone}</a></>}</p>
                <p className="mt-1 text-xs text-muted-foreground">{l.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })} UTC · {l.type.replace("_", " ")}{l.source ? ` · ${l.source}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", l.score >= 60 ? "bg-emerald-500/15 text-emerald-400" : l.score >= 30 ? "bg-amber-500/15 text-amber-400" : "bg-secondary text-muted-foreground")}>score {l.score}</span>
                <InlineSelect endpoint={`/api/admin/leads/${l.id}`} field="status" value={l.status} options={LEAD_STATUSES} />
              </div>
            </div>
            {(l.service || l.budget || l.timeline) && (
              <p className="mt-3 flex flex-wrap gap-2 text-xs">
                {[l.service, l.budget, l.timeline].filter(Boolean).map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-1">{t}</span>)}
              </p>
            )}
            {l.message && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 text-sm text-foreground/85">{l.message}</p>}
            {l.meta && Object.values(l.meta).some(Boolean) && <p className="mt-2 text-xs text-muted-foreground">{Object.entries(l.meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</p>}
            <details className="mt-3"><summary className="cursor-pointer text-xs text-muted-foreground">Notes</summary><div className="mt-2"><NotesEditor endpoint={`/api/admin/leads/${l.id}`} value={l.notes ?? ""} /></div></details>
          </li>
        ))}
      </ul>
    </div>
  );
}
