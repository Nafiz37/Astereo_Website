import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "AI chats" };
export const dynamic = "force-dynamic";

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ human?: string }> }) {
  await requireAdmin();
  const { human } = await searchParams;
  const db = await getDb();
  const rows = await db
    .select({
      id: tables.chatSessions.id,
      createdAt: tables.chatSessions.createdAt,
      updatedAt: tables.chatSessions.updatedAt,
      needsHuman: tables.chatSessions.needsHuman,
      leadId: tables.chatSessions.leadId,
      messages: sql<number>`(select count(*)::int from chat_messages m where m.session_id = ${tables.chatSessions.id} and m.role = 'user' and m.text <> '')`,
      first: sql<string>`(select m.text from chat_messages m where m.session_id = ${tables.chatSessions.id} and m.role = 'user' order by m.seq asc limit 1)`,
    })
    .from(tables.chatSessions)
    .where(human ? eq(tables.chatSessions.needsHuman, true) : undefined)
    .orderBy(desc(tables.chatSessions.updatedAt))
    .limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI chats <span className="text-base font-normal text-muted-foreground">({rows.length})</span></h1>
        <Link href={human ? "/admin/chats" : "/admin/chats?human=1"} className="text-sm text-primary hover:underline">{human ? "Show all" : "Only needing a human"}</Link>
      </div>
      {rows.length === 0 && <p className="surface p-6 text-sm text-muted-foreground">No conversations yet.</p>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/chats/${r.id}`} className="surface surface-hover flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.first ?? "(empty)"}</span>
                <span className="text-xs text-muted-foreground">{r.updatedAt.toLocaleString("en-GB", { timeZone: "UTC" })} UTC · {r.messages} message{r.messages === 1 ? "" : "s"}</span>
              </span>
              <span className="flex gap-2 text-xs">
                {r.leadId && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-400">lead captured</span>}
                {r.needsHuman && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-400">needs human</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
