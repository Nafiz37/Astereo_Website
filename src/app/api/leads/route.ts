import { createLead } from "@/lib/leads";
import { ok, readJson, throttle } from "@/lib/http";
import { leadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await throttle(req, "lead", 5, 600);
  if (limited) return limited;

  const parsed = await readJson(req, leadSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  // Honeypot tripped: pretend success so bots learn nothing.
  if (d.website) return ok({ id: null });

  const lead = await createLead(
    {
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone,
      company: d.company,
      service: d.service,
      budget: d.budget,
      timeline: d.timeline,
      message: d.message,
      source: d.source,
      meta: { role: d.role, link: d.link },
    },
    { extra: { Role: d.role, Link: d.link } },
  );
  return ok({ id: lead.id });
}
