import { NextResponse } from "next/server";
import { business } from "@/content/site";
import { listOpenSlots } from "@/lib/bookings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const slots = await listOpenSlots();
  return NextResponse.json(
    { ok: true, timezone: business.timezone, slotMinutes: business.slotMinutes, slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
