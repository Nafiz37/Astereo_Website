import { getAdmin } from "@/lib/auth";
import { emailProvider, fromAddress, notifyAddress, sendEmail } from "@/lib/email";
import { fail, ok, sameOrigin, throttle } from "@/lib/http";

export const runtime = "nodejs";

/** Admin-only: sends a test message to NOTIFY_EMAIL so the email setup can be verified end to end. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-origin request blocked");
  const admin = await getAdmin();
  if (!admin) return fail(401, "Unauthorized");
  const limited = await throttle(req, "test-email", 5, 600);
  if (limited) return limited;

  const provider = emailProvider();
  if (provider === "none") return fail(503, "No email provider configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS (or RESEND_API_KEY) and restart.");
  const to = notifyAddress();
  const res = await sendEmail({
    to,
    subject: "[Astareo] Test email",
    html: "<p>This is a test email from your Astareo website. If you can read this, booking confirmations and lead notifications will be delivered.</p>",
  });
  if (!res.sent) return fail(502, `Sending failed via ${res.provider}: ${res.reason ?? "unknown error"}`, { provider: res.provider });
  return ok({ provider: res.provider, to, from: fromAddress() });
}
