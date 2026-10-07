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