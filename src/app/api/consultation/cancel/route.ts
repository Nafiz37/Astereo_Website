import { z } from "zod";
import { cancelConsultation } from "@/lib/bookings";
import { fail, ok, readJson, throttle } from "@/lib/http";

export const runtime = "nodejs";
const schema = z.object({ id: z.string().uuid(), token: z.string().min(10).max(100) });

export async function POST(req: Request) {
  const limited = await throttle(req, "cancel", 10, 3600);
  if (limited) return limited;
  const parsed = await readJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const row = await cancelConsultation(parsed.data.id, parsed.data.token);
  return row ? ok({}) : fail(404, "Booking not found or already cancelled.");
}
