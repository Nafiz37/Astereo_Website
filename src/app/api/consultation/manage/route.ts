import { NextResponse } from "next/server";
import { z } from "zod";
import { business } from "@/content/site";
import { canReschedule, findBookingByToken } from "@/lib/bookings";
import { fail, throttle } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const query = z.object({ id: z.string().uuid(), token: z.string().min(10).max(100) });

/** Returns just enough about a booking for the "manage my booking" page. The secret token is the credential. */
export async function GET(req: Request) {
  const limited = await throttle(req, "manage", 40, 600);
  if (limited) return limited;
  const url = new URL(req.url);
  const parsed = query.safeParse({ id: url.searchParams.get("id"), token: url.searchParams.get("token") });
  if (!parsed.success) return fail(404, "Booking not found");
  const b = await findBookingByToken(parsed.data.id, parsed.data.token);
  if (!b) return fail(404, "Booking not found");
  return NextResponse.json(
    {
      ok: true,
      booking: {
        name: b.name.split(" ")[0],
        startsAt: b.startsAt.toISOString(),
        durationMin: b.durationMin,
        status: b.status,
        rescheduleCount: b.rescheduleCount,
        canReschedule: canReschedule(b),
        cutoffHours: business.changeCutoffHours,
        isPast: b.startsAt.getTime() <= Date.now(),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
