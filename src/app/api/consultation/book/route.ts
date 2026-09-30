import { bookConsultation } from "@/lib/bookings";
import { fail, ok, readJson, throttle } from "@/lib/http";
import { bookingSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await throttle(req, "book", 6, 3600);
  if (limited) return limited;
  const parsed = await readJson(req, bookingSchema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;
  if (d.website) return ok({ booking: null });

  const result = await bookConsultation({
    startsAt: d.startsAt,
    name: d.name,
    email: d.email,
    phone: d.phone,
    company: d.company,
    topic: d.topic,
    notes: d.notes,
    timezone: d.timezone,
    locale: req.headers.get("x-lang") === "bn" ? "bn" : "en",
  });
  if (!result.ok) {
    const map = {
      slot_unavailable: [409, "That time is no longer available. Please pick another slot."],
      slot_taken: [409, "Someone just booked that slot. Please pick another time."],
      too_many_bookings: [429, "You already have upcoming consultations booked with this email."],
    } as const;
    const [status, msg] = map[result.reason];
    return fail(status, msg, { reason: result.reason });
  }
  const b = result.booking;
  return ok({ booking: { id: b.id, startsAt: b.startsAt.toISOString(), durationMin: b.durationMin }, emailed: result.emailed });
}
