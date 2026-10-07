import { asc, eq, sql } from "drizzle-orm";
import { site } from "@/content/site";
import { getDb, tables } from "@/db";
import { rateLimit } from "@/lib/rate-limit";
import { runAgent, type AgentContent, type AgentPart, type ModelFn } from "./core";
import { geminiConfigured, geminiModel } from "./gemini";
import { systemPrompt } from "./prompt";
import { buildTools } from "./tools";

export const MAX_USER_MESSAGES_PER_SESSION = 30;

export type ChatEvent =
  | { t: "session"; id: string }
  | { t: "text"; d: string }
  | { t: "tool"; name: string }
  | { t: "done" }
  | { t: "error"; message: string };

const OFFLINE = (lang?: string) =>
  lang === "bn"
    ? `আমাদের এআই অ্যাসিস্ট্যান্ট এই মুহূর্তে অফলাইনে আছে, তবে আমাদের টিম সাহায্য করতে পারবে: ${site.url}/bn/get-started এ বিনামূল্যে পরামর্শ বুক করুন, যোগাযোগ ফর্ম ব্যবহার করুন, অথবা ${site.email} / ${site.phoneDisplay} এ যোগাযোগ করুন।`
    : `Our AI assistant is offline right now, but a person can help: book a free consultation at ${site.url}/get-started, use the contact form, or email ${site.email} / call ${site.phoneDisplay}.`;
const BUSY = (lang?: string) =>
  lang === "bn"
    ? `এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন, অথবা বিনামূল্যে পরামর্শ বুক করুন / ${site.email} এ ইমেইল করুন; আমাদের টিম সাহায্য করবে।`
    : `I'm having trouble answering right now. Please try again in a moment, or book a free consultation / email ${site.email} and our team will help.`;
const LIMIT = (lang?: string) =>
  lang === "bn"
    ? `এই চ্যাটে আমরা অনেক কথা বলে ফেলেছি। চালিয়ে যেতে ${site.url}/bn/get-started এ বিনামূল্যে পরামর্শ বুক করুন অথবা ${site.email} এ ইমেইল করুন।`
    : `We've covered a lot in this chat. To continue, please book a free consultation at ${site.url}/get-started or email ${site.email}.`;

export function rowsToHistory(rows: { role: string; parts: unknown[] }[]): AgentContent[] {
  return rows.map((r) => ({ role: r.role === "model" ? "model" : "user", parts: r.parts as AgentPart[] }));
}

export async function handleChat(opts: {
  sessionId?: string;
  message: string;
  timezone?: string;
  lang?: "en" | "bn";
  ipHash: string;
  userAgent?: string;
  emit: (e: ChatEvent) => void;
  /** Injectable for tests. Defaults to Gemini. */
  model?: ModelFn;
  signal?: AbortSignal;
}) {
  const { emit } = opts;
  const db = await getDb();

  // Global daily budget protects the free Gemini quota from abuse.
  const budget = Number(process.env.CHAT_DAILY_LIMIT ?? 600);
  const day = new Date().toISOString().slice(0, 10);
  const global = await rateLimit(`chat-global:${day}`, budget, 86_400);

  // Resolve or create the session. Unknown ids create a fresh session (never trust the client).
  let sessionId = opts.sessionId;
  if (sessionId) {
    const [found] = await db.select({ id: tables.chatSessions.id }).from(tables.chatSessions).where(eq(tables.chatSessions.id, sessionId)).limit(1);
    if (!found) sessionId = undefined;
  }
  if (!sessionId) {
    const [created] = await db.insert(tables.chatSessions).values({ ipHash: opts.ipHash, userAgent: opts.userAgent?.slice(0, 300) }).returning({ id: tables.chatSessions.id });
    sessionId = created.id;
  }
  emit({ t: "session", id: sessionId });

  const rows = await db
    .select({ role: tables.chatMessages.role, parts: tables.chatMessages.parts })
    .from(tables.chatMessages)
    .where(eq(tables.chatMessages.sessionId, sessionId))
    .orderBy(asc(tables.chatMessages.seq));

  const userCount = rows.filter((r) => r.role === "user").length;
  const persist = async (role: "user" | "model" | "tool", text: string, parts: unknown[]) => {
    await db.insert(tables.chatMessages).values({ sessionId: sessionId!, role, text, parts });
    await db.update(tables.chatSessions).set({ updatedAt: new Date() }).where(eq(tables.chatSessions.id, sessionId!));
  };

  const reply = async (text: string) => {
    emit({ t: "text", d: text });
    await persist("user", opts.message, [{ text: opts.message }]);
    await persist("model", text, [{ text }]);
    emit({ t: "done" });
  };

  if (userCount >= MAX_USER_MESSAGES_PER_SESSION) {
    return reply(LIMIT(opts.lang));
  }
  if (!global.allowed) return reply(BUSY(opts.lang));

  const model = opts.model ?? (geminiConfigured() ? geminiModel(systemPrompt(new Date(), opts.timezone, opts.lang)) : null);
  if (!model) return reply(OFFLINE(opts.lang));

  const tools = buildTools({ sessionId, timezone: opts.timezone, lang: opts.lang });
  // The user turn is persisted first so it survives model failures.
  await persist("user", opts.message, [{ text: opts.message }]);

  try {
    const result = await runAgent({
      history: rowsToHistory(rows),
      userMessage: opts.message,
      model,
      tools,
      signal: opts.signal,
      events: {
        onText: (d) => emit({ t: "text", d }),
        onToolStart: (name) => emit({ t: "tool", name }),
        onTurn: async (turn) => {
          // The user turn was already stored above.
          await persist(turn.role, turn.text, turn.parts);
        },
      },
    });
    if (!result.text.trim()) {
      emit({ t: "text", d: BUSY(opts.lang) });
      await persist("model", BUSY(opts.lang), [{ text: BUSY(opts.lang) }]);
    }
  } catch (err) {
    console.error("[chat] model error", err);
    emit({ t: "text", d: BUSY(opts.lang) });
    await persist("model", BUSY(opts.lang), [{ text: BUSY(opts.lang) }]);
  }
  emit({ t: "done" });
}

export async function countSessions() {
  const db = await getDb();
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(tables.chatSessions);
  return r.n;
}
