import Link from "@/components/ui/link";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { SystemStatus } from "@/components/admin/system-status";
import { getDb, tables } from "@/db";
import { emailProvider, notifyAddress } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";
import { formatInZone } from "@/lib/scheduling";
import { daysAgo } from "@/lib/utils";
import { business } from "@/content/site";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const db = await getDb();
  const week = daysAgo(7);
  const [[newLeads], [weekLeads], [upcoming], [humanChats], [subs]] = await Promise.all([
    db.select({ n: count() }).from(tables.leads).where(eq(tables.leads.status, "new")),
    db.select({ n: count() }).from(tables.leads).where(gte(tables.leads.createdAt, week)),
    db.select({ n: count() }).from(tables.consultations).where(and(eq(tables.consultations.status, "confirmed"), gte(tables.consultations.startsAt, new Date()))),
    db.select({ n: count() }).from(tables.chatSessions).where(eq(tables.chatSessions.needsHuman, true)),
    db.select({ n: count() }).from(tables.subscribers),
  ]);
  const recent = await db.select().from(tables.leads).orderBy(desc(tables.leads.createdAt)).limit(6);
  const next = await db.select().from(tables.consultations).where(and(eq(tables.consultations.status, "confirmed"), gte(tables.consultations.startsAt, new Date()))).orderBy(tables.consultations.startsAt).limit(6);

  const cards = [
    { label: "New leads", value: newLeads.n, href: "/admin/leads?status=new" },
    { label: "Leads (7 days)", value: weekLeads.n, href: "/admin/leads" },
    { label: "Upcoming consultations", value: upcoming.n, href: "/admin/consultations?view=upcoming" },
    { label: "Chats needing a human", value: humanChats.n, href: "/admin/chats?human=1" },
    { label: "Newsletter subscribers", value: subs.n, href: "/admin/subscribers" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="surface surface-hover p-5">
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>
      <SystemStatus status={{ database: true, ai: Boolean(process.env.GEMINI_API_KEY), emailProvider: emailProvider(), admin: true, notifyTo: notifyAddress() }} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-5">
          <h2 className="mb-3 font-semibold">Latest leads</h2>
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
          <ul className="divide-y divide-border">
            {recent.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span><span className="font-medium">{l.name}</span> <span className="text-muted-foreground">· {l.type.replace("_", " ")}{l.company ? ` · ${l.company}` : ""}</span></span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">score {l.score}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="surface p-5">
          <h2 className="mb-3 font-semibold">Upcoming consultations <span className="text-xs font-normal text-muted-foreground">({business.timezone})</span></h2>
          {next.length === 0 && <p className="text-sm text-muted-foreground">Nothing booked.</p>}
          <ul className="divide-y divide-border">
            {next.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium">{formatInZone(b.startsAt.getTime(), business.timezone)}</span>
                <span className="text-muted-foreground">{b.name}{b.company ? ` · ${b.company}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
