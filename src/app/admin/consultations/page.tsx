import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { and, asc, count, desc, eq, gte, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import { InlineSelect } from "@/components/admin/inline-select";
import { business } from "@/content/site";
import { getDb, tables } from "@/db";
import { BOOKING_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatInZone, zonedParts, zonedTimeToUtc } from "@/lib/scheduling";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultations" };
export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

/** [start, end) of the current day in the business timezone, as Dates. */
function businessDay(offsetDays = 0) {
  const p = zonedParts(Date.now(), business.timezone);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays));
  const start = zonedTimeToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), 0, 0, business.timezone);
  const nextDay = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays + 1));
  const end = zonedTimeToUtc(nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate(), 0, 0, business.timezone);
  return { start: new Date(start), end: new Date(end) };
}

const dayHeading = (d: Date) => formatInZone(d.getTime(), business.timezone, { hour: undefined, minute: undefined, weekday: "long", month: "long", day: "numeric", year: "numeric" });
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: business.timezone }).format(d);

export default async function ConsultationsPage({ searchParams }: { searchParams: Promise<{ view?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const view: ViewId = VIEWS.some((v) => v.id === sp.view) ? (sp.view as ViewId) : "upcoming";
  const db = await getDb();
  const C = tables.consultations;
  const now = new Date();
  const today = businessDay(0);
  const weekEnd = businessDay(7).start;

  // ---- summary numbers -------------------------------------------------------------------------------------------
  const num = async (where?: SQL) => (await db.select({ n: count() }).from(C).where(where))[0].n;
  const confirmed = eq(C.status, "confirmed");
  const [upcoming, todayCount, weekCount, total, cancelled, rescheduled, completed] = await Promise.all([
    num(and(confirmed, gte(C.startsAt, now))),
    num(and(confirmed, gte(C.startsAt, today.start), lt(C.startsAt, today.end))),
    num(and(confirmed, gte(C.startsAt, now), lt(C.startsAt, weekEnd))),
    num(),
    num(eq(C.status, "cancelled")),
    num(sql`${C.rescheduleCount} > 0`),
    num(eq(C.status, "completed")),
  ]);

  // ---- list for the selected view --------------------------------------------------------------------------------
  const conds: SQL[] = [];
  let order = asc(C.startsAt);
  if (view === "upcoming") conds.push(confirmed, gte(C.startsAt, now));
  else if (view === "today") conds.push(gte(C.startsAt, today.start), lt(C.startsAt, today.end), sql`${C.status} <> 'cancelled'`);
  else if (view === "past") {
    conds.push(lt(C.startsAt, now), sql`${C.status} <> 'cancelled'`);
    order = desc(C.startsAt) as unknown as typeof order;
  } else if (view === "cancelled") {
    conds.push(eq(C.status, "cancelled"));
    order = desc(C.startsAt) as unknown as typeof order;
  } else order = desc(C.startsAt) as unknown as typeof order;
  if (sp.q) {
    const like = `%${sp.q.replace(/[%_]/g, "")}%`;
    conds.push(or(ilike(C.name, like), ilike(C.email, like), ilike(C.company, like))!);
  }
  const rows = await db.select().from(C).where(conds.length ? and(...conds) : undefined).orderBy(order).limit(300);

  // ---- next 14 days load ----------------------------------------------------------------------------------------
  const horizon = await db.select({ startsAt: C.startsAt }).from(C).where(and(confirmed, gte(C.startsAt, today.start), lt(C.startsAt, businessDay(14).start)));
  const perDay = new Map<string, number>();
  for (const r of horizon) perDay.set(dayKey(r.startsAt), (perDay.get(dayKey(r.startsAt)) ?? 0) + 1);
  const next14 = Array.from({ length: 14 }, (_, i) => {
    const d = businessDay(i).start;
    return { key: dayKey(d), label: formatInZone(d.getTime(), business.timezone, { hour: undefined, minute: undefined, weekday: "short", month: "short", day: "numeric" }), n: perDay.get(dayKey(d)) ?? 0 };
  });
  const maxN = Math.max(1, ...next14.map((d) => d.n));

  // Group by business-day when the list is chronological.
  const groups: { key: string; heading: string; items: typeof rows }[] = [];
  for (const r of rows) {
    const key = dayKey(r.startsAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(r);
    else groups.push({ key, heading: dayHeading(r.startsAt), items: [r] });
  }

  const cards = [
    { label: "Upcoming", value: upcoming, view: "upcoming" },
    { label: "Today", value: todayCount, view: "today" },
    { label: "Next 7 days", value: weekCount, view: "upcoming" },
    { label: "Completed", value: completed, view: "past" },
    { label: "Cancelled", value: cancelled, view: "cancelled" },
    { label: "Rescheduled", value: rescheduled, view: "all" },
    { label: "Total ever booked", value: total, view: "all" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Consultations <span className="text-base font-normal text-muted-foreground">(times shown in {business.timezone})</span></h1>
        {/* CSV download from an API route, not a page link */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/export?type=consultations" className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Export CSV</a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((c) => (
          <Link key={c.label} href={`/admin/consultations?view=${c.view}`} className="surface surface-hover p-4">
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <section className="surface p-5" aria-label="Bookings per day for the next 14 days">
        <h2 className="mb-3 text-sm font-semibold">Next 14 days</h2>
        <ul className="flex h-28 items-end gap-1.5">
          {next14.map((d) => (
            <li key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${d.n} booked`}>
              <span className="text-[10px] text-muted-foreground">{d.n || ""}</span>
              <span className={cn("w-full rounded-t", d.n ? "bg-primary" : "bg-secondary")} style={{ height: `${Math.max(d.n ? 12 : 4, (d.n / maxN) * 72)}px` }} />
              <span className="text-[9px] leading-tight text-muted-foreground">{d.label.split(",")[0]}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1.5" aria-label="Filter bookings">
          {VIEWS.map((v) => (
            <Link key={v.id} href={`/admin/consultations?view=${v.id}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`} aria-current={v.id === view ? "page" : undefined} className={cn("rounded-full px-3.5 py-1.5 text-sm", v.id === view ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              {v.label}
            </Link>
          ))}
        </nav>
        <form role="search" className="flex gap-2">
          <input type="hidden" name="view" value={view} />
          <input name="q" defaultValue={sp.q} placeholder="Search name, email, company…" className="field w-64" aria-label="Search bookings" />
          <button className="rounded-lg bg-primary px-4 text-sm text-white">Search</button>
        </form>
      </div>

      {rows.length === 0 && <p className="surface p-6 text-sm text-muted-foreground">No consultations in this view.</p>}

      {view === "past" || view === "cancelled" || view === "all" ? (
        <div className="overflow-x-auto">
          <table className="surface w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">When</th><th>Who</th><th>Topic</th><th>Booked</th><th>Status</th></tr></thead>
            <tbody className="divide-y divide-border">{rows.map((b) => <BookingRow key={b.id} b={b} table />)}</tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-2 flex items-baseline justify-between text-sm font-semibold">
                {g.heading}
                <span className="text-xs font-normal text-muted-foreground">{g.items.length} session{g.items.length === 1 ? "" : "s"}</span>
              </h2>
              <ul className="surface divide-y divide-border">
                {g.items.map((b) => <BookingRow key={b.id} b={b} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

type Row = typeof tables.consultations.$inferSelect;

function BookingRow({ b, table = false }: { b: Row; table?: boolean }) {
  const team = formatInZone(b.startsAt.getTime(), business.timezone, { weekday: table ? "short" : undefined, month: table ? "short" : undefined, day: table ? "numeric" : undefined, year: table ? "numeric" : undefined, timeZoneName: "short" });
  const visitor = b.visitorTimezone && b.visitorTimezone !== business.timezone ? formatInZone(b.startsAt.getTime(), b.visitorTimezone, { weekday: undefined, month: undefined, day: undefined, timeZoneName: "short" }) : null;
  const movedFrom = b.rescheduleCount > 0 && b.originalStartsAt ? formatInZone(b.originalStartsAt.getTime(), business.timezone, { year: "numeric", timeZoneName: "short" }) : null;
  const bookedOn = formatInZone(b.createdAt.getTime(), business.timezone, { year: "numeric" });

  const who = (
    <>
      <span className="font-medium">{b.name}</span>
      {b.company && <span className="text-muted-foreground"> · {b.company}</span>}
      <br />
      <a href={`mailto:${b.email}`} className="text-primary hover:underline">{b.email}</a>
      {b.phone && <span className="text-muted-foreground"> · {b.phone}</span>}
      {b.notes && <p className="mt-1 max-w-md whitespace-pre-wrap text-xs text-muted-foreground">{b.notes}</p>}
    </>
  );
  const badges = (
    <span className="mt-1 flex flex-wrap gap-1.5">
      {b.rescheduleCount > 0 && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">rescheduled ×{b.rescheduleCount}{movedFrom ? ` (first: ${movedFrom})` : ""}</span>}
      {b.cancelledAt && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">cancelled {formatInZone(b.cancelledAt.getTime(), business.timezone, { year: "numeric" })}</span>}
    </span>
  );
  const status = <InlineSelect endpoint={`/api/admin/consultations/${b.id}`} field="status" value={b.status} options={BOOKING_STATUSES} />;

  if (table)
    return (
      <tr className="align-top">
        <td className="p-3 font-medium">{team}{visitor && <span className="block text-xs font-normal text-muted-foreground">visitor: {visitor}</span>}{badges}</td>
        <td className="py-3 pr-3">{who}</td>
        <td className="py-3 pr-3 text-muted-foreground">{b.topic ?? "-"}</td>
        <td className="py-3 pr-3 text-xs text-muted-foreground">{bookedOn}<br />via {b.bookedVia}</td>
        <td className="py-3 pr-3">{status}</td>
      </tr>
    );
  return (
    <li className="grid gap-3 p-4 text-sm md:grid-cols-[170px_1fr_auto] md:items-start">