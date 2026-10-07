import { eq } from "drizzle-orm";
import { caseStudies } from "@/content/case-studies";
import { engagementModels } from "@/content/company";
import { industries } from "@/content/industries";
import { solutions } from "@/content/solutions";
import { budgets, business, compliance, engagementProcess, markets, services, site, timelines } from "@/content/site";
import { getDb, tables } from "@/db";
import { bookConsultation, listOpenSlots } from "@/lib/bookings";
import { leadNotification, notifyAddress, sendEmail } from "@/lib/email";
import { createLead } from "@/lib/leads";
import { formatInZone, isValidTimezone } from "@/lib/scheduling";
import { emailField } from "@/lib/validation";
import type { ToolHandler } from "./core";

export type ToolContext = { sessionId: string; timezone?: string; lang?: "en" | "bn" };

/** JSON-schema tool declarations sent to the model. */
export const toolDeclarations = [
  {
    name: "get_services",
    description: "List Astareo's solutions, or get details of one. Use for any question about what Astareo builds.",
    parametersJsonSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "Optional solution slug, e.g. custom-software, ai-agents, lms, erp, blog-cms, news-portal, ticketing, devops-cicd" } },
    },
  },
  {
    name: "get_industries",
    description: "List the industries Astareo serves and how, or details of one industry slug.",
    parametersJsonSchema: { type: "object", properties: { slug: { type: "string" } } },
  },
  {
    name: "get_case_studies",
    description: "Representative project examples. Check each item's 'verified' flag before stating any result.",
    parametersJsonSchema: { type: "object", properties: { industry_or_solution: { type: "string", description: "Optional filter keyword" } } },
  },
  {
    name: "get_company_info",
    description: "Company facts: contact details, delivery process, engagement models, markets, security/compliance posture and consultation hours.",
    parametersJsonSchema: { type: "object", properties: {} },
  },
  {
    name: "get_available_slots",
    description: "Get upcoming open 30-minute consultation slots (a spread over the next days).",
    parametersJsonSchema: {
      type: "object",
      properties: { on_or_after: { type: "string", description: "Optional YYYY-MM-DD; only return slots on/after this date" }, max: { type: "integer", description: "Max slots to return (default 6, max 10)" } },
    },
  },
  {
    name: "book_consultation",
    description: "Book a free consultation. Only call after the visitor explicitly confirmed the details and the slot (user_confirmed=true). startsAt must be an exact ISO value returned by get_available_slots.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        startsAt: { type: "string", description: "Exact ISO 8601 start time from get_available_slots" },
        company: { type: "string" },
        phone: { type: "string" },
        topic: { type: "string", enum: [...services] },
        notes: { type: "string", description: "What the visitor wants to discuss" },
        user_confirmed: { type: "boolean", description: "True only if the visitor explicitly said yes to these details" },
      },
      required: ["name", "email", "startsAt", "user_confirmed"],
    },
  },
  {
    name: "save_lead",
    description: "Save a qualified prospect for the sales team. Call once you have name, email and a project summary. Calling again updates the same lead.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        service: { type: "string", enum: [...services] },
        budget: { type: "string", enum: [...budgets] },
        timeline: { type: "string", enum: [...timelines] },
        summary: { type: "string", description: "1-3 sentence summary of the project and needs" },
      },
      required: ["name", "email", "summary"],
    },
  },
  {
    name: "request_human",
    description: "Flag the conversation for a human follow-up (visitor asked for a person, complaint, or you cannot help).",
    parametersJsonSchema: { type: "object", properties: { reason: { type: "string" } }, required: ["reason"] },
  },
] as const;

const s = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const opt = (v: unknown, allowed: readonly string[]) => (typeof v === "string" && allowed.includes(v) ? v : undefined);

export function buildTools(ctx: ToolContext): Record<string, ToolHandler> {
  const tz = ctx.timezone && isValidTimezone(ctx.timezone) ? ctx.timezone : undefined;

  const linkLead = async (leadId: string) => {
    const db = await getDb();
    await db.update(tables.chatSessions).set({ leadId, updatedAt: new Date() }).where(eq(tables.chatSessions.id, ctx.sessionId));
  };

  return {
    get_services: async (args) => {
      const slug = s(args.slug, 60);
      const one = slug ? solutions.find((x) => x.slug === slug) : undefined;
      if (one) return { name: one.name, page: `/solutions/${one.slug}`, overview: one.overview, features: one.features.map((f) => f.title), useCases: one.useCases, tech: one.tech, deliverables: one.deliverables };
      return { solutions: solutions.map((x) => ({ slug: x.slug, name: x.name, summary: x.summary, page: `/solutions/${x.slug}` })) };
    },

    get_industries: async (args) => {
      const slug = s(args.slug, 60);
      const one = slug ? industries.find((x) => x.slug === slug) : undefined;
      if (one) return { name: one.name, page: `/industries/${one.slug}`, overview: one.overview, challenges: one.challenges, offerings: one.offerings, considerations: one.considerations };
      return { industries: industries.map((x) => ({ slug: x.slug, name: x.name, headline: x.headline })) };
    },

    get_case_studies: async (args) => {
      const q = s(args.industry_or_solution, 60)?.toLowerCase();
      const list = caseStudies.filter((c) => !q || `${c.industry} ${c.solution} ${c.title}`.toLowerCase().includes(q));
      return {
        note: "Case studies marked verified=false are representative examples without confirmed results: do NOT state their metrics as fact.",
        caseStudies: list.map((c) => ({ title: c.title, industry: c.industry, page: `/case-studies/${c.slug}`, challenge: c.challenge, approach: c.approach, verified: c.verified, ...(c.verified ? { results: c.metrics } : {}) })),
      };
    },

    get_company_info: async () => ({
      name: site.name,
      founded: site.foundedYear,
      email: site.email,
      phone: site.phoneDisplay,
      markets: markets.map((m) => m.name),
      process: engagementProcess.map((p) => `${p.title}: ${p.desc}`),
      engagementModels: engagementModels.map((m) => ({ name: m.name, for: m.tag, description: m.desc })),
      pricing: "No public price list. Pricing depends on scope. Free project assessment and written estimate.",
      security: compliance.map((c) => ({ standard: c.name, status: c.certified ? "certified" : "we build to align with this standard (not certified)" })),
      consultation: { durationMin: business.slotMinutes, timezone: business.timezone, responseTarget: business.responseTarget },
      pages: ["/solutions", "/industries", "/case-studies", "/pricing", "/blog", "/contact", "/get-started"],
    }),

    get_available_slots: async (args) => {
      const all = await listOpenSlots();
      const from = s(args.on_or_after, 10);
      const max = Math.min(10, Math.max(1, Number(args.max) || 6));
      const filtered = all.filter((iso) => !from || iso.slice(0, 10) >= from);
      // Spread across days: at most 3 per business day.
      const perDay = new Map<string, number>();
      const picked: string[] = [];
      for (const iso of filtered) {
        const day = formatInZone(Date.parse(iso), business.timezone, { weekday: undefined, hour: undefined, minute: undefined, month: "numeric", day: "numeric", year: "numeric" });
        const n = perDay.get(day) ?? 0;
        if (n >= 3) continue;
        perDay.set(day, n + 1);
        picked.push(iso);
        if (picked.length >= max) break;
      }
      return {
        slots: picked.map((iso) => ({
          startsAt: iso,
          visitorLocal: tz ? formatInZone(Date.parse(iso), tz, { timeZoneName: "short" }) : undefined,
          teamLocal: formatInZone(Date.parse(iso), business.timezone, { timeZoneName: "short" }),
        })),
        durationMin: business.slotMinutes,
        none: picked.length === 0 ? "No open slots right now. Suggest emailing or calling instead." : undefined,
      };
    },

    book_consultation: async (args) => {
      if (args.user_confirmed !== true) return { error: "Not booked: ask the visitor to explicitly confirm the details first, then call again with user_confirmed=true." };
      const email = emailField.safeParse(args.email);
      const name = s(args.name, 120);
      const startsAt = s(args.startsAt, 40);
      if (!email.success) return { error: "That email address looks invalid. Ask the visitor to re-enter it." };
      if (!name || name.length < 2) return { error: "A name is required." };
      if (!startsAt) return { error: "startsAt is required." };
      const result = await bookConsultation({
        startsAt,
        name,
        email: email.data,
        company: s(args.company, 160),
        phone: s(args.phone, 30),
        topic: opt(args.topic, services),
        notes: s(args.notes, 2000),
        timezone: tz,
        locale: ctx.lang,
        via: "chat",
      });
      if (!result.ok) {
        return { booked: false, reason: result.reason, advice: result.reason === "too_many_bookings" ? "They already have upcoming bookings; suggest checking their email." : "Fetch fresh slots with get_available_slots and offer alternatives." };
      }
      if (result.booking.leadId) await linkLead(result.booking.leadId);
      return {
        booked: true,
        confirmation: `Booked for ${formatInZone(result.booking.startsAt.getTime(), tz ?? business.timezone, { year: "numeric", timeZoneName: "short" })}`,
        emailSentTo: email.data,
        note: "A calendar invite and the video link will be emailed.",
      };
    },

    save_lead: async (args) => {
      const email = emailField.safeParse(args.email);
      const name = s(args.name, 120);
      const summary = s(args.summary, 2000);
      if (!email.success || !name || !summary) return { error: "name, a valid email and a summary are required." };
      const db = await getDb();
      const [session] = await db.select().from(tables.chatSessions).where(eq(tables.chatSessions.id, ctx.sessionId)).limit(1);
      const fields = {
        name,
        email: email.data,
        company: s(args.company, 160),
        phone: s(args.phone, 30),
        service: opt(args.service, services),
        budget: opt(args.budget, budgets),
        timeline: opt(args.timeline, timelines),
        message: summary,
      };
      if (session?.leadId) {
        await db.update(tables.leads).set({ ...fields, updatedAt: new Date() }).where(eq(tables.leads.id, session.leadId));
        return { saved: true, updated: true };
      }
      const lead = await createLead({ type: "chat", ...fields, source: "chat", meta: { sessionId: ctx.sessionId } }, { extra: { "Chat session": ctx.sessionId } });
      await linkLead(lead.id);
      return { saved: true, message: "The team will follow up within one business day." };
    },

    request_human: async (args) => {
      const db = await getDb();
      await db.update(tables.chatSessions).set({ needsHuman: true, updatedAt: new Date() }).where(eq(tables.chatSessions.id, ctx.sessionId));
      const mail = leadNotification({ type: "chat (needs human)", name: "Chat visitor", email: "unknown", message: s(args.reason, 1000) ?? "Visitor asked for a human", extra: { "Chat session": ctx.sessionId } });
      await sendEmail({ to: notifyAddress(), ...mail });
      return { flagged: true, contact: { email: site.email, phone: site.phoneDisplay }, responseTarget: business.responseTarget };
    },
  };
}
