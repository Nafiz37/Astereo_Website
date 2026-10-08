import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import { eq } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { adminSetBookingStatus, bookConsultation, cancelConsultation, findBookingByToken, listOpenSlots, rescheduleConsultation } from "@/lib/bookings";

const mails: ParsedMail[] = [];
let server: SMTPServer;
const saved = { ...process.env };
let slots: string[] = [];
let n = 100;

const toOf = (m: ParsedMail) => (m.to && "text" in m.to ? m.to.text : "");
const icsOf = (m: ParsedMail | undefined) => m?.attachments.find((a) => a.filename === "astareo-consultation.ics")?.content.toString() ?? "";
const visitorMail = (email: string, re: RegExp) => mails.find((m) => toOf(m).includes(email) && re.test(m.subject ?? ""));
const teamMail = (re: RegExp) => mails.find((m) => toOf(m).includes("team@astareo.test") && re.test(m.subject ?? ""));

async function book(slotIdx: number, extra: { locale?: "en" | "bn" } = {}) {
  const email = `manage${++n}@example.com`;
  const r = await bookConsultation({ startsAt: slots[slotIdx], name: `Manage Tester ${n}`, email, topic: "LMS Platforms", ...extra });
  if (!r.ok) throw new Error(`booking failed: ${r.reason}`);
  return { booking: r.booking, email };
}

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: ["STARTTLS"],
    onAuth: (auth, _s, cb) => (auth.username === "m@example.com" && auth.password === "pw" ? cb(null, { user: "m" }) : cb(new Error("Invalid login"))),
    onData: (stream, _s, cb) => {
      simpleParser(stream).then((m) => (mails.push(m), cb()), cb);
    },
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.server.address() as { port: number };
  Object.assign(process.env, { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), SMTP_USER: "m@example.com", SMTP_PASS: "pw", NOTIFY_EMAIL: "team@astareo.test" });
  slots = await listOpenSlots();
});

beforeEach(() => {
  mails.length = 0;
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  process.env = saved;
});

describe("confirmation email", () => {
  it("contains a working manage link (and the Bangla variant for Bangla bookings)", async () => {
    const en = await book(50);
    const html = visitorMail(en.email, /confirmed/)?.html as string;
    expect(html).toContain(`/get-started/manage?id=${en.booking.id}&token=${en.booking.cancelToken}`);
    expect(html).not.toContain("/bn/get-started");
    const bn = await book(51, { locale: "bn" });
    expect(visitorMail(bn.email, /confirmed/)?.html as string).toContain(`/bn/get-started/manage?id=${bn.booking.id}`);
  });
});

describe("rescheduling", () => {
  it("moves the booking, frees the old slot, bumps the counter and emails both sides with an UPDATED calendar event", async () => {
    const { booking, email } = await book(60);
    mails.length = 0;
    const r = await rescheduleConsultation({ id: booking.id, token: booking.cancelToken, startsAt: slots[61] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.booking.startsAt.toISOString()).toBe(slots[61]);
    expect(r.booking.rescheduleCount).toBe(1);
    expect(r.booking.originalStartsAt?.toISOString()).toBe(slots[60]);
    expect(r.emailed).toBe(true);

    const open = await listOpenSlots();
    expect(open).toContain(slots[60]); // old slot is free again
    expect(open).not.toContain(slots[61]); // new slot is taken

    const toVisitor = visitorMail(email, /rescheduled/);
    expect(toVisitor, "visitor email").toBeTruthy();
    expect(toVisitor!.html).toContain("New time");
    const ics = icsOf(toVisitor);
    expect(ics).toContain(`UID:${booking.id}@`); // same UID => calendar replaces the old event
    expect(ics).toContain("SEQUENCE:1");
    expect(ics).toContain("METHOD:REQUEST");
    expect(teamMail(/rescheduled/), "team email").toBeTruthy();
  });

  it("keeps the FIRST original time across several reschedules", async () => {
    const { booking } = await book(62);
    await rescheduleConsultation({ id: booking.id, token: booking.cancelToken, startsAt: slots[63] });
    const r2 = await rescheduleConsultation({ id: booking.id, token: booking.cancelToken, startsAt: slots[64] });
    expect(r2.ok && r2.booking.rescheduleCount).toBe(2);
    expect(r2.ok && r2.booking.originalStartsAt?.toISOString()).toBe(slots[62]);
    expect(icsOf(visitorMail(booking.email, /rescheduled/))).toContain("SEQUENCE:");
  });

  it("rejects a wrong token, a taken slot, the same slot, a non-offered time and changes nothing", async () => {
    const a = await book(70);
    const b = await book(71);
    expect(await rescheduleConsultation({ id: a.booking.id, token: "wrong-token-wrong-token", startsAt: slots[72] })).toEqual({ ok: false, reason: "not_found" });
    expect(await rescheduleConsultation({ id: a.booking.id, token: a.booking.cancelToken, startsAt: slots[71] })).toEqual({ ok: false, reason: "slot_taken" }); // taken by b (caught by the DB constraint)
    expect(await rescheduleConsultation({ id: a.booking.id, token: a.booking.cancelToken, startsAt: slots[70] })).toEqual({ ok: false, reason: "same_slot" });
    const odd = new Date(Date.parse(slots[72]) + 60_000).toISOString();
    expect(await rescheduleConsultation({ id: a.booking.id, token: a.booking.cancelToken, startsAt: odd })).toEqual({ ok: false, reason: "slot_unavailable" });
    const still = await findBookingByToken(a.booking.id, a.booking.cancelToken);
    expect(still?.startsAt.toISOString()).toBe(slots[70]);
    expect(still?.rescheduleCount).toBe(0);
    expect(b.booking.startsAt.toISOString()).toBe(slots[71]);
    expect(mails.filter((m) => /rescheduled/.test(m.subject ?? ""))).toHaveLength(0);
  });

  it("refuses to reschedule inside the cutoff window and for inactive bookings", async () => {
    const { booking } = await book(73);
    const nearStart = booking.startsAt.getTime() - 60 * 60_000; // 1 hour before the session (cutoff is 2h)
    expect(await rescheduleConsultation({ id: booking.id, token: booking.cancelToken, startsAt: slots[74] }, nearStart)).toEqual({ ok: false, reason: "too_late" });
    await cancelConsultation(booking.id, booking.cancelToken);
    expect(await rescheduleConsultation({ id: booking.id, token: booking.cancelToken, startsAt: slots[74] })).toEqual({ ok: false, reason: "not_active" });
  });

  it("is race-safe: two bookings moving to the same slot at once, only one wins", async () => {
    const a = await book(80);
    const b = await book(81);
    const results = await Promise.all([
      rescheduleConsultation({ id: a.booking.id, token: a.booking.cancelToken, startsAt: slots[82] }),
      rescheduleConsultation({ id: b.booking.id, token: b.booking.cancelToken, startsAt: slots[82] }),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    const loser = results.find((r) => !r.ok);
    expect(loser && !loser.ok && ["slot_taken", "slot_unavailable"].includes(loser.reason)).toBe(true);
  });
});

describe("cancellation", () => {
  it("emails the VISITOR and the team, sends a calendar CANCEL, and reopens the slot", async () => {
    const { booking, email } = await book(90);
    mails.length = 0;
    const row = await cancelConsultation(booking.id, booking.cancelToken);
    expect(row?.status).toBe("cancelled");
    expect(row?.cancelledAt).toBeTruthy();

    const toVisitor = visitorMail(email, /cancelled/);
    expect(toVisitor, "visitor cancellation email").toBeTruthy();
    expect(toVisitor!.html).toContain("Book a new time");
    const ics = icsOf(toVisitor);
    expect(ics).toContain("METHOD:CANCEL");
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics).toContain(`UID:${booking.id}@`);
    expect(teamMail(/cancelled by visitor/i), "team email").toBeTruthy();
    expect(await listOpenSlots()).toContain(slots[90]);
  });

  it("cannot be cancelled twice, with a wrong token, or after the session started", async () => {
    const { booking } = await book(91);
    expect(await cancelConsultation(booking.id, "wrong-token-wrong-token")).toBeNull();
    expect(await cancelConsultation(booking.id, booking.cancelToken, booking.startsAt.getTime() + 1000)).toBeNull();
    expect(await cancelConsultation(booking.id, booking.cancelToken)).not.toBeNull();
    mails.length = 0;
    expect(await cancelConsultation(booking.id, booking.cancelToken)).toBeNull();
    expect(mails).toHaveLength(0); // no duplicate emails
  });

  it("admin cancelling emails the visitor too; other status changes send nothing", async () => {
    const { booking, email } = await book(92);
    mails.length = 0;
    const row = await adminSetBookingStatus(booking.id, "cancelled");
    expect(row?.status).toBe("cancelled");
    const toVisitor = visitorMail(email, /cancelled/);
    expect(toVisitor?.html).toContain("we had to cancel");
    expect(teamMail(/cancelled by team/i)).toBeTruthy();

    const other = await book(93);
    mails.length = 0;
    await adminSetBookingStatus(other.booking.id, "completed");
    expect(mails).toHaveLength(0);
    const db = await getDb();
    const [r] = await db.select().from(tables.consultations).where(eq(tables.consultations.id, other.booking.id));
    expect(r.status).toBe("completed");
  });
});
