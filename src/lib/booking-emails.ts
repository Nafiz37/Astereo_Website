import { business, site } from "@/content/site";
import type { Consultation } from "@/db/schema";
import { esc, layout, row } from "./email";
import { formatInZone } from "./scheduling";

type Booking = Pick<Consultation, "id" | "name" | "email" | "phone" | "company" | "topic" | "notes" | "startsAt" | "durationMin" | "visitorTimezone" | "cancelToken" | "locale" | "rescheduleCount">;

/** Link in every email: lets the visitor reschedule or cancel without an account. */
export const manageUrl = (b: Pick<Booking, "id" | "cancelToken" | "locale">) => `${site.url}${b.locale === "bn" ? "/bn" : ""}/get-started/manage?id=${b.id}&token=${b.cancelToken}`;
const bookAgainUrl = (b: Pick<Booking, "locale">) => `${site.url}${b.locale === "bn" ? "/bn" : ""}/get-started`;

const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const fold = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/**
 * iCalendar invite. The UID is the booking id, so when the visitor reschedules we send the same UID with a higher
 * SEQUENCE and calendar apps UPDATE the existing event; a CANCEL method removes it.
 */
export function buildIcs(b: { id: string; startsAt: Date; durationMin: number; summary: string; description: string; attendeeEmail: string; sequence?: number; method?: "REQUEST" | "CANCEL" }) {
  const end = new Date(b.startsAt.getTime() + b.durationMin * 60_000);
  const method = b.method ?? "REQUEST";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Astareo//Consultation//EN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${b.id}@${site.domain}`,
    `SEQUENCE:${b.sequence ?? 0}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(b.startsAt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${fold(b.summary)}`,
    `DESCRIPTION:${fold(b.description)}`,
    `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
    `ORGANIZER;CN=Astareo:mailto:${site.email}`,
    `ATTENDEE;RSVP=TRUE:mailto:${b.attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const icsAttachment = (ics: string) => [{ filename: "astareo-consultation.ics", content: Buffer.from(ics).toString("base64") }];

function times(b: Booking, at: Date = b.startsAt) {
  return {
    visitor: formatInZone(at.getTime(), b.visitorTimezone || business.timezone, { year: "numeric", timeZoneName: "short" }),
    team: formatInZone(at.getTime(), business.timezone, { year: "numeric", timeZoneName: "short" }),
  };
}

const details = (b: Booking, extra: [string, string][]) =>
  `<table>${extra.map(([k, v]) => row(k, v)).join("")}${row("Name", b.name)}${row("Email", b.email)}${row("Phone", b.phone)}${row("Company", b.company)}${row("Topic", b.topic)}</table>`;

const inviteFor = (b: Booking, method: "REQUEST" | "CANCEL" = "REQUEST", sequence = b.rescheduleCount) =>
  icsAttachment(
    buildIcs({ id: b.id, startsAt: b.startsAt, durationMin: b.durationMin, summary: "Astareo free consultation", description: `Topic: ${b.topic ?? "General"}\nWe will contact you with the meeting link before the call.`, attendeeEmail: b.email, sequence, method }),
  );

/** Sent right after a booking is made. */
export function confirmationEmails(b: Booking) {
  const t = times(b);
  const attachments = inviteFor(b);
  return {
    toVisitor: {
      subject: `Your Astareo consultation is confirmed - ${t.visitor}`,
      html: layout(
        "Your consultation is confirmed",
        `<p>Hi ${esc(b.name.split(" ")[0])}, you're booked for a free ${b.durationMin}-minute consultation.</p>
         <p style="font-size:18px;font-weight:600">${esc(t.visitor)}</p>
         <p>We will email the video-call link before the session. A calendar invite is attached.</p>
         <p><a href="${manageUrl(b)}" style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Reschedule or cancel</a></p>
         <p style="color:#64748b;font-size:13px">You can reschedule up to ${business.changeCutoffHours} hours before the session, and cancel at any time before it starts.</p>`,
      ),
      attachments,
    },
    toTeam: {
      subject: `[Astareo] Consultation booked: ${b.name} - ${t.team}`,
      html: layout("New consultation booked", `${details(b, [["When (team)", t.team], ["When (visitor)", t.visitor]])}<p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px">${esc(b.notes)}</p>`),
      attachments,
    },
  };
}

/** Sent after the visitor moves their booking. `b` is the UPDATED booking; `previous` is the old time. */
export function rescheduledEmails(b: Booking, previous: Date) {
  const now = times(b);
  const before = times(b, previous);
  const attachments = inviteFor(b);
  return {
    toVisitor: {
      subject: `Your Astareo consultation was rescheduled - ${now.visitor}`,
      html: layout(
        "Your consultation has been rescheduled",
        `<p>Hi ${esc(b.name.split(" ")[0])}, your free consultation has moved.</p>
         <p style="color:#64748b;margin:0">Previously: <s>${esc(before.visitor)}</s></p>
         <p style="font-size:18px;font-weight:600;margin:6px 0 16px">New time: ${esc(now.visitor)}</p>
         <p>An updated calendar invite is attached; it will replace the old event in your calendar.</p>
         <p><a href="${manageUrl(b)}">Need to change it again?</a></p>`,
      ),
      attachments,
    },
    toTeam: {
      subject: `[Astareo] Consultation rescheduled: ${b.name} - now ${now.team}`,
      html: layout("Consultation rescheduled", details(b, [["New time (team)", now.team], ["Was (team)", before.team], ["New time (visitor)", now.visitor], ["Times rescheduled", String(b.rescheduleCount)]])),
      attachments,
    },
  };
}

/** Sent when a booking is cancelled, by the visitor or by the Astareo team. `b` is the booking as it was. */
export function cancelledEmails(b: Booking, by: "visitor" | "team") {
  const t = times(b);
  const attachments = inviteFor(b, "CANCEL", b.rescheduleCount + 1);
  return {
    toVisitor: {