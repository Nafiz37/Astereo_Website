"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { CalendarCheck, CheckCircle2, Globe, Loader2 } from "lucide-react";
import Link from "@/components/ui/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { services, site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { useDict, useLang } from "@/i18n/client";
import { Field, Honeypot, Input, Select, Textarea } from "./fields";
import { SlotPicker } from "./slot-picker";

export function BookingWidget() {
  const d = useDict();
  const lang = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const num = (n: number | string) => (lang === "bn" ? toBanglaDigits(n) : String(n));

  // Visitor's timezone: "UTC" on the server and during hydration, the real zone afterwards.
  const tz = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    () => "UTC",
  );
  const [minutes, setMinutes] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [confirmed, setConfirmed] = useState<{ startsAt: string; emailed: boolean } | null>(null);

  const fmtFull = (iso: string) => new Intl.DateTimeFormat(loc, { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(new Date(iso));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) {
      setFormError(d.booking.chooseFirst);
      return;
    }
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { startsAt: slot, timezone: tz, consent: fd.get("consent") === "on" };
    fd.forEach((v, k) => {
      if (k !== "consent" && typeof v === "string") body[k] = v;
    });
    setStatus("sending");
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/consultation/book", { method: "POST", headers: { "Content-Type": "application/json", "x-lang": lang }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setConfirmed({ startsAt: json.booking?.startsAt ?? slot, emailed: json.emailed !== false });
        setStatus("done");
        return;
      }
      setErrors(json.fields ?? {});
      const reason = (json.reason ?? "") as keyof typeof d.booking.reasons;
      setFormError(json.fields ? "" : (d.booking.reasons[reason] ?? (res.status === 429 ? d.form.errRate : d.booking.couldNot)));
      if (res.status === 409) {
        setSlot(null);
        setReloadKey((k) => k + 1);
      }
      setStatus("idle");
    } catch {
      setFormError(d.booking.network);
      setStatus("idle");
    }
  }

  if (status === "done" && confirmed) {
    return (
      <div className="surface mx-auto max-w-xl p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <h2 className="mt-4 text-2xl font-semibold">{d.booking.booked}</h2>
        <p className="mt-3 text-lg font-medium text-primary">{fmtFull(confirmed.startsAt)}</p>
        <p className="mt-1 text-sm text-muted-foreground">{tz.replace("_", " ")}</p>
        <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">
          {confirmed.emailed ? (
            d.booking.emailedOk
          ) : (
            <>
              {d.booking.emailedFail}{" "}
              <a className="text-primary underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              .
            </>
          )}
        </p>
        <ButtonLink className="mt-6" variant="ghost" href="/">
          {d.common.backHome}
        </ButtonLink>
      </div>
    );
  }