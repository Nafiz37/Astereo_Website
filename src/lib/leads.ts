import { getDb, tables } from "@/db";
import type { NewLead } from "@/db/schema";
import { autoReply, leadNotification, notifyAddress, sendAll } from "./email";

const BUDGET_POINTS: Record<string, number> = {
  "Under $5k": 5,
  "$5k – $15k": 15,
  "$15k – $50k": 28,
  "$50k – $150k": 35,
  "$150k+": 40,
};
const TIMELINE_POINTS: Record<string, number> = {
  "ASAP (< 1 month)": 20,
  "1–3 months": 25,
  "3–6 months": 15,
  "6+ months": 8,
  "Just exploring": 2,
};

/** Simple, explainable 0-100 lead score used to prioritise follow-up. */
export function scoreLead(l: Pick<NewLead, "budget" | "timeline" | "company" | "phone" | "message" | "service">) {
  let s = 0;
  s += BUDGET_POINTS[l.budget ?? ""] ?? 0;
  s += TIMELINE_POINTS[l.timeline ?? ""] ?? 0;
  if (l.company) s += 10;
  if (l.phone) s += 8;
  if (l.service && l.service !== "Not sure yet") s += 7;
  const len = (l.message ?? "").length;
  s += len > 400 ? 12 : len > 150 ? 8 : len > 40 ? 4 : 0;
  return Math.min(100, s);
}

export async function createLead(input: Omit<NewLead, "id" | "score" | "createdAt" | "updatedAt" | "status">, opts: { notify?: boolean; extra?: Record<string, unknown> } = {}) {
  const db = await getDb();
  const score = scoreLead(input);
  const [lead] = await db
    .insert(tables.leads)
    .values({ ...input, score })
    .returning();

  if (opts.notify !== false) {
    const n = leadNotification({ ...lead, extra: opts.extra });
    // Awaited on purpose: serverless hosts can freeze the function right after the response is sent.
    // sendAll never rejects, so a mail outage can't fail the visitor's submission.
    const mails = [{ to: notifyAddress(), replyTo: lead.email, ...n }];
    if (lead.type !== "chat") {
      const reply = autoReply(lead.name, (["contact", "partner", "career", "chat"] as const).find((k) => k === lead.type) ?? "contact");
      mails.push({ to: lead.email, ...reply } as (typeof mails)[number]);
    }
    await sendAll(mails);
  }
  return lead;
}
