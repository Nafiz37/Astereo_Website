import { z } from "zod";
import { rescheduleConsultation } from "@/lib/bookings";
import { fail, ok, readJson, throttle } from "@/lib/http";

export const runtime = "nodejs";
const schema = z.object({ id: z.string().uuid(), token: z.string().min(10).max(100), startsAt: z.string().datetime({ offset: true }) });

const STATUS = { not_found: 404, not_active: 409, too_late: 403, slot_unavailable: 409, slot_taken: 409, same_slot: 409 } as const;
const MESSAGE = {
  not_found: "Booking not found.",
  not_active: "This booking is no longer active.",
  too_late: "It is too close to the session to reschedule online. Please contact us.",
  slot_unavailable: "That time is no longer available. Please pick another slot.",
  slot_taken: "Someone just booked that slot. Please pick another time.",
  same_slot: "That is already your current time. Please pick a different slot.",
} as const;

export async function POST(req: Request) {
  const limited = await throttle(req, "reschedule", 10, 3600);
  if (limited) return limited;
  const parsed = await readJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const result = await rescheduleConsultation(parsed.data);
  if (!result.ok) return fail(STATUS[result.reason], MESSAGE[result.reason], { reason: result.reason });
  return ok({ booking: { startsAt: result.booking.startsAt.toISOString(), rescheduleCount: result.booking.rescheduleCount }, emailed: result.emailed });
}
