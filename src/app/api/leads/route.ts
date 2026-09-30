import { createLead } from "@/lib/leads";
import { ok, readJson, throttle } from "@/lib/http";
import { leadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await throttle(req, "lead", 5, 600);
  if (limited) return limited;

  const parsed = await readJson(req, leadSchema);