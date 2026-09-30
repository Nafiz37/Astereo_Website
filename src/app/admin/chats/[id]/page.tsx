import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, tables } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Chat transcript" };
export const dynamic = "force-dynamic";

type Part = { functionCall?: { name?: string; args?: unknown }; functionResponse?: { name?: string; response?: unknown } };

export default async function ChatDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = await getDb();
  const [session] = await db.select().from(tables.chatSessions).where(eq(tables.chatSessions.id, id)).limit(1);
  if (!session) notFound();
  const messages = await db.select().from(tables.chatMessages).where(eq(tables.chatMessages.sessionId, id)).orderBy(asc(tables.chatMessages.seq));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/chats" className="text-sm text-muted-foreground hover:text-foreground">← All chats</Link>
      <h1 className="text-xl font-semibold">Transcript <span className="text-sm font-normal text-muted-foreground">{session.createdAt.toLocaleString("en-GB", { timeZone: "UTC" })} UTC</span></h1>
      {session.needsHuman && <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">The assistant flagged this conversation for human follow-up.</p>}
      <ul className="space-y-3">
        {messages.map((m) => {
          const parts = m.parts as Part[];
          const calls = parts.filter((p) => p.functionCall);
          const results = parts.filter((p) => p.functionResponse);
          if (m.role === "tool") {
            return results.map((r, i) => (
              <li key={`${m.id}-${i}`} className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground"><strong>{r.functionResponse?.name}</strong> → <code className="break-all">{JSON.stringify(r.functionResponse?.response).slice(0, 400)}</code></li>
            ));
          }
          return (
            <li key={m.id} className={cn("max-w-[90%] rounded-2xl px-4 py-3 text-sm", m.role === "user" ? "ml-auto bg-primary text-white" : "bg-secondary")}>
              {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
              {calls.map((c, i) => <p key={i} className="mt-2 text-xs opacity-70">🔧 {c.functionCall?.name}({JSON.stringify(c.functionCall?.args)})</p>)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
