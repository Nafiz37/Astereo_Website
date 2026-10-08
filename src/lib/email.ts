import { site } from "@/content/site";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

export type EmailProvider = "smtp" | "resend" | "none";
export type SendResult = { sent: boolean; provider: EmailProvider; reason?: string };

/** SMTP (e.g. Gmail app password, Brevo, Zoho) wins over Resend when both are configured. */
export function emailProvider(): EmailProvider {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return "none";
}

/** "Name <addr>" used as the From header. For SMTP it defaults to the authenticated user. */
export function fromAddress() {
  return process.env.EMAIL_FROM || (emailProvider() === "smtp" ? `Astareo <${process.env.SMTP_USER}>` : "Astareo <onboarding@resend.dev>");
}

async function sendViaSmtp(mail: Mail): Promise<SendResult> {
  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 = implicit TLS; 587/25 upgrade with STARTTLS.
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      tls: process.env.SMTP_ALLOW_SELF_SIGNED === "true" ? { rejectUnauthorized: false } : undefined,
    });
    await transporter.sendMail({
      from: fromAddress(),
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content, "base64"), contentType: a.filename.endsWith(".ics") ? "text/calendar; method=REQUEST" : undefined })),
    });
    return { sent: true, provider: "smtp" };
  } catch (err) {
    const reason = (err as Error).message?.slice(0, 200) ?? "SMTP error";
    console.error("[email] SMTP error:", reason);
    return { sent: false, provider: "smtp", reason };
  }
}

/**
 * Sends email via SMTP or Resend (both have free tiers). Without a provider it logs instead,
 * so forms and bookings still work in development. Never throws: callers treat email as best-effort,
 * but they must AWAIT it: serverless hosts can freeze the function as soon as the response is sent.
 */
export async function sendEmail(mail: Mail): Promise<SendResult> {
  const provider = emailProvider();
  if (provider === "smtp") return sendViaSmtp(mail);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email:disabled] to=${[mail.to].flat().join(",")} subject="${mail.subject}"`);
    return { sent: false, provider: "none", reason: "No email provider configured (set SMTP_* or RESEND_API_KEY)" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: mail.replyTo,
        attachments: mail.attachments,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body.slice(0, 300));
      // Resend's free onboarding sender can only deliver to the account owner until a domain is verified.
      return { sent: false, provider: "resend", reason: `Resend HTTP ${res.status}: ${body.slice(0, 160)}` };
    }
    return { sent: true, provider: "resend" };
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false, provider: "resend", reason: "network error" };
  }
}

/** Runs several sends concurrently and waits for all of them (never rejects). */
export const sendAll = (mails: Mail[]) => Promise.all(mails.map((m) => sendEmail(m)));

export const notifyAddress = () => process.env.NOTIFY_EMAIL?.trim() || site.email;

export function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0a0f1e;padding:20px 28px;color:#fff;font-size:18px;font-weight:600">Astareo</td></tr>
<tr><td style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px">${esc(site.legalName)} · ${esc(site.email)} · ${esc(site.phoneDisplay)}</td></tr>
</table></td></tr></table></body></html>`;
}

export const row = (k: string, v: unknown) =>
  v ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>` : "";

export function leadNotification(l: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  timeline?: string | null;
  message?: string | null;
  score?: number;
  extra?: Record<string, unknown>;
}) {
  const extra = Object.entries(l.extra ?? {}).map(([k, v]) => row(k, v)).join("");
  return {
    subject: `[Astareo] New ${l.type.replace("_", " ")} lead: ${l.name}${l.company ? ` (${l.company})` : ""}`,
    html: layout(
      "New lead received",
      `<table>${row("Type", l.type)}${row("Name", l.name)}${row("Email", l.email)}${row("Phone", l.phone)}${row("Company", l.company)}${row("Service", l.service)}${row("Budget", l.budget)}${row("Timeline", l.timeline)}${row("Score", l.score)}${extra}</table>
       <p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px">${esc(l.message)}</p>`,
    ),
  };
}

export function autoReply(name: string, kind: "contact" | "partner" | "career" | "chat") {
  const what = { contact: "your enquiry", partner: "your partnership request", career: "your application", chat: "your conversation" }[kind];
  return {
    subject: "We received your message - Astareo",
    html: layout(
      `Thanks, ${name.split(" ")[0]}!`,
      `<p>We have received ${what}. A member of our team will reply within one business day.</p>
       <p>If it is urgent, call us on <a href="tel:${site.phone}">${esc(site.phoneDisplay)}</a>.</p>`,
    ),
  };
}
