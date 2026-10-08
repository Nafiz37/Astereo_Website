import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import { bookConsultation, listOpenSlots } from "@/lib/bookings";
import { createLead } from "@/lib/leads";
import { emailProvider, sendEmail } from "@/lib/email";

const received: ParsedMail[] = [];
let server: SMTPServer;
const env = { ...process.env };

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: ["STARTTLS"],
    onAuth(auth, _session, cb) {
      if (auth.username === "mailer@example.com" && auth.password === "app-password") cb(null, { user: auth.username });
      else cb(new Error("Invalid login"));
    },
    onData(stream, _session, cb) {
      simpleParser(stream).then((m) => {
        received.push(m);
        cb();
      }, cb);
    },
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.server.address() as { port: number };
  Object.assign(process.env, { SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), SMTP_USER: "mailer@example.com", SMTP_PASS: "app-password", NOTIFY_EMAIL: "team@astareo.test" });
});

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()));
  process.env = env;
});

describe("email delivery (SMTP)", () => {
  it("selects SMTP and delivers a message", async () => {
    expect(emailProvider()).toBe("smtp");
    const res = await sendEmail({ to: "someone@example.com", subject: "Hello", html: "<p>Hi</p>" });
    expect(res).toMatchObject({ sent: true, provider: "smtp" });
    const m = received.at(-1)!;
    expect(m.subject).toBe("Hello");
    expect(m.from?.text).toContain("mailer@example.com");
  });

  it("reports a clear failure reason when credentials are wrong, without throwing", async () => {
    const good = process.env.SMTP_PASS;
    process.env.SMTP_PASS = "wrong";
    const res = await sendEmail({ to: "x@example.com", subject: "nope", html: "x" });
    process.env.SMTP_PASS = good;
    expect(res.sent).toBe(false);
    expect(res.reason).toMatch(/invalid login|auth/i);
  });

  it("sends visitor confirmation (with .ics invite) and team notification when a consultation is booked", async () => {
    const slots = await listOpenSlots();
    received.length = 0;
    const r = await bookConsultation({ startsAt: slots[40], name: "Email Tester", email: "visitor@example.com", topic: "LMS Platforms", notes: "Need an LMS" });
    expect(r.ok && r.emailed).toBe(true);
    const toVisitor = received.find((m) => m.to && "text" in m.to && m.to.text.includes("visitor@example.com"));
    const toTeam = received.find((m) => m.to && "text" in m.to && m.to.text.includes("team@astareo.test"));
    expect(toVisitor?.subject).toMatch(/consultation is confirmed/i);
    expect(toTeam?.subject).toMatch(/Consultation booked/);
    const ics = toVisitor?.attachments.find((a) => a.filename === "astareo-consultation.ics");
    expect(ics).toBeTruthy();
    expect(ics!.content.toString()).toContain("BEGIN:VEVENT");
    expect(ics!.content.toString()).toContain("ATTENDEE;RSVP=TRUE:mailto:visitor@example.com");
  });

  it("emails the team and auto-replies to the visitor for a contact lead", async () => {
    received.length = 0;
    await createLead({ type: "contact", name: "Lead Person", email: "lead@example.com", message: "Please contact me about ERP" });
    const subjects = received.map((m) => m.subject);
    expect(subjects.some((s) => /New contact lead: Lead Person/.test(s ?? ""))).toBe(true);
    expect(subjects.some((s) => /We received your message/.test(s ?? ""))).toBe(true);
  });

  it("escapes HTML in notification content", async () => {
    received.length = 0;
    await createLead({ type: "contact", name: "<script>x</script>", email: "xss@example.com", message: "<img src=x onerror=alert(1)> hello there friend" });
    const html = received.find((m) => /New contact lead/.test(m.subject ?? ""))?.html as string;
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });
});
