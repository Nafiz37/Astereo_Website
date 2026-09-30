import { z } from "zod";
import { BOOKING_STATUSES } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { adminSetBookingStatus } from "@/lib/bookings";
import { fail, ok, readJson } from "@/lib/http";

export const runtime = "nodejs";
const schema = z.object({ status: z.enum(BOOKING_STATUSES) });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return fail(401, "Unauthorized");
  const { id } = await ctx.params;
  if (!z.string().uuid().safeParse(id).success) return fail(400, "Invalid id");
  const parsed = await readJson(req, schema);
  if ("error" in parsed) return parsed.error;
  const row = await adminSetBookingStatus(id, parsed.data.status);
  return row ? ok({}) : fail(404, "Booking not found");
}
