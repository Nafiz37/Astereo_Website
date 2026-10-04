"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";

export type Status = { database: boolean; ai: boolean; emailProvider: string; admin: boolean; notifyTo: string };

const Row = ({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) => (
  <li className="flex items-center gap-2 py-2 text-sm">
    {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}
    <span className="font-medium">{label}</span>
    {detail && <span className="text-muted-foreground">· {detail}</span>}
  </li>
);

export function SystemStatus({ status }: { status: Status }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const emailOn = status.emailProvider !== "none";

  async function sendTest() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      setResult(res.ok && json.ok ? { ok: true, text: `Sent via ${json.provider} to ${json.to}. Check the inbox (and spam).` } : { ok: false, text: json.error ?? "Failed" });
    } catch {
      setResult({ ok: false, text: "Network error" });
    }
    setBusy(false);
  }

  return (
    <section className="surface p-5">
      <h2 className="font-semibold">System status</h2>
      <ul className="mt-2 divide-y divide-border">
        <Row ok={status.database} label="Database" detail={status.database ? "connected" : "not connected"} />
        <Row ok={emailOn} label="Email" detail={emailOn ? `${status.emailProvider} → notifications to ${status.notifyTo}` : "not configured: bookings work, but no emails are sent"} />
        <Row ok={status.ai} label="AI assistant" detail={status.ai ? "Gemini key set" : "no GEMINI_API_KEY: chat shows an offline notice"} />
        <Row ok={status.admin} label="Admin login" detail="configured" />
      </ul>
      <button type="button" onClick={sendTest} disabled={busy || !emailOn} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send test email
      </button>
      {result && (
        <p role="status" className={`mt-3 text-sm ${result.ok ? "text-emerald-400" : "text-destructive"}`}>
          {result.text}
        </p>
      )}
    </section>
  );
}
