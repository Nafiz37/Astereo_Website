import { timingSafeEqual } from "node:crypto";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { business } from "@/content/site";
import { getDb, tables } from "@/db";
import type { Consultation } from "@/db/schema";
import { cancelledEmails, confirmationEmails, rescheduledEmails } from "./booking-emails";
import { newToken } from "./crypto";
import { notifyAddress, sendAll } from "./email";
import { createLead } from "./leads";
import { availableSlots, isOfferedSlot, isValidTimezone } from "./scheduling";

const rules = () => ({ ...business, closedDates: [...business.closedDates] });

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

/** Open slots (ISO strings) from now until the booking horizon. */
export async function listOpenSlots(now = Date.now()): Promise<string[]> {
  const db = await getDb();
  const horizon = new Date(now + (business.horizonDays + 2) * 86_400_000);
  const booked = await db
    .select({ startsAt: tables.consultations.startsAt })
    .from(tables.consultations)
    .where(and(eq(tables.consultations.status, "confirmed"), gte(tables.consultations.startsAt, new Date(now)), lte(tables.consultations.startsAt, horizon)));
  return availableSlots(now, booked.map((b) => b.startsAt.getTime()), rules()).map((t) => new Date(t).toISOString());
}

export type BookInput = {
  startsAt: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  topic?: string;
  notes?: string;
  timezone?: string;
  locale?: "en" | "bn";
  via?: "web" | "chat";
};

export type BookResult =
  | { ok: true; booking: Consultation; /** false when the confirmation email could not be sent */ emailed: boolean }
  | { ok: false; reason: "slot_unavailable" | "slot_taken" | "too_many_bookings" };

export async function bookConsultation(input: BookInput, now = Date.now()): Promise<BookResult> {
  const startMs = Date.parse(input.startsAt);
  if (!Number.isFinite(startMs) || !isOfferedSlot(startMs, now, rules())) return { ok: false, reason: "slot_unavailable" };
  const db = await getDb();

  // Limit abuse: at most 2 upcoming confirmed bookings per email address.
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tables.consultations)
    .where(and(eq(tables.consultations.email, input.email), eq(tables.consultations.status, "confirmed"), gte(tables.consultations.startsAt, new Date(now))));
  if (n >= 2) return { ok: false, reason: "too_many_bookings" };

  try {
    const [booking] = await db
      .insert(tables.consultations)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        topic: input.topic,
        notes: input.notes,
        startsAt: new Date(startMs),
        durationMin: business.slotMinutes,
        visitorTimezone: input.timezone && isValidTimezone(input.timezone) ? input.timezone : null,
        cancelToken: newToken(),
        bookedVia: input.via ?? "web",
        locale: input.locale ?? "en",
      })
      .returning();

    // Create the CRM lead only for successful bookings (failed attempts would just add noise).
    try {
      const lead = await createLead(
        { type: "get_started", name: input.name, email: input.email, phone: input.phone, company: input.company, service: input.topic, message: input.notes ?? "Consultation booking", source: input.via === "chat" ? "chat-booking" : "booking" },
        { notify: false },
      );
      await db.update(tables.consultations).set({ leadId: lead.id }).where(eq(tables.consultations.id, booking.id));
      booking.leadId = lead.id;
    } catch (err) {
      // The booking itself succeeded; never fail the visitor because CRM bookkeeping hiccuped.
      console.error("[booking] lead creation failed", err);
    }

    const mails = confirmationEmails(booking);
    const [toVisitor, toTeam] = await sendAll([
      { to: booking.email, replyTo: notifyAddress(), ...mails.toVisitor },
      { to: notifyAddress(), replyTo: booking.email, ...mails.toTeam },
    ]);
    if (!toVisitor.sent) console.warn(`[booking] confirmation email to visitor not sent (${toVisitor.provider}): ${toVisitor.reason}`);
    if (!toTeam.sent) console.warn(`[booking] team notification not sent (${toTeam.provider}): ${toTeam.reason}`);
    return { ok: true, booking, emailed: toVisitor.sent };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "slot_taken" };
    throw err;
  }
}

/** Finds a booking by id and secret token (constant-time compare). Returns null for any mismatch. */
export async function findBookingByToken(id: string, token: string): Promise<Consultation | null> {
  const db = await getDb();
  const [row] = await db.select().from(tables.consultations).where(eq(tables.consultations.id, id)).limit(1);
  return row && safeEqual(row.cancelToken, token) ? row : null;
}

/** Can the visitor still move this booking themselves? */
export const canReschedule = (b: Pick<Consultation, "status" | "startsAt">, now = Date.now()) =>
  b.status === "confirmed" && b.startsAt.getTime() - now >= business.changeCutoffHours * 3_600_000;

export type RescheduleResult =
  | { ok: true; booking: Consultation; previous: Date; emailed: boolean }
  | { ok: false; reason: "not_found" | "not_active" | "too_late" | "slot_unavailable" | "slot_taken" | "same_slot" };

export async function rescheduleConsultation(input: { id: string; token: string; startsAt: string }, now = Date.now()): Promise<RescheduleResult> {
  const current = await findBookingByToken(input.id, input.token);
  if (!current) return { ok: false, reason: "not_found" };
  if (current.status !== "confirmed") return { ok: false, reason: "not_active" };
  if (!canReschedule(current, now)) return { ok: false, reason: "too_late" };

  const newMs = Date.parse(input.startsAt);
  if (!Number.isFinite(newMs) || !isOfferedSlot(newMs, now, rules())) return { ok: false, reason: "slot_unavailable" };
  if (newMs === current.startsAt.getTime()) return { ok: false, reason: "same_slot" };

  const db = await getDb();
  try {
    const [updated] = await db
      .update(tables.consultations)
      .set({
        startsAt: new Date(newMs),
        rescheduleCount: current.rescheduleCount + 1,
        originalStartsAt: current.originalStartsAt ?? current.startsAt,
      })
      // The status/old-time guard makes a double-submit or a concurrent change a no-op instead of a double update.
      .where(and(eq(tables.consultations.id, current.id), eq(tables.consultations.status, "confirmed"), eq(tables.consultations.startsAt, current.startsAt)))
      .returning();
    if (!updated) return { ok: false, reason: "not_active" };

    const mails = rescheduledEmails(updated, current.startsAt);
    const [toVisitor, toTeam] = await sendAll([
      { to: updated.email, replyTo: notifyAddress(), ...mails.toVisitor },
      { to: notifyAddress(), replyTo: updated.email, ...mails.toTeam },
    ]);
    if (!toVisitor.sent) console.warn(`[booking] reschedule email to visitor not sent (${toVisitor.provider}): ${toVisitor.reason}`);
    if (!toTeam.sent) console.warn(`[booking] reschedule notification to team not sent (${toTeam.provider}): ${toTeam.reason}`);
    return { ok: true, booking: updated, previous: current.startsAt, emailed: toVisitor.sent };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, reason: "slot_taken" };
    throw err;
  }
}
