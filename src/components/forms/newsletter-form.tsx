"use client";

import { useState, type FormEvent } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { useDict, useLang } from "@/i18n/client";
import { Honeypot } from "./fields";

export function NewsletterForm({ source = "footer" }: { source?: string }) {
  const d = useDict();
  const lang = useLang();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json", "x-lang": lang }, body: JSON.stringify({ email: fd.get("email"), website: fd.get("website"), source }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("done");
        return;
      }
      setMsg(json.fields?.email ?? d.newsletter.error);
      setStatus("error");
    } catch {
      setMsg(d.newsletter.network);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-400" role="status">
        <Check className="h-4 w-4" /> {d.newsletter.done}
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      <Honeypot />
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{d.newsletter.emailLabel}</span>
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="email" type="email" required placeholder={d.newsletter.placeholder} autoComplete="email" dir="ltr" className="field pl-9" />
        </label>
        <button type="submit" disabled={status === "sending"} className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60">
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : d.newsletter.subscribe}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {msg}
        </p>
      )}
    </form>
  );
}
