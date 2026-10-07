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