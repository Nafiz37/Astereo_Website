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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="surface p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck className="h-5 w-5 text-primary" /> {d.booking.pickTime}
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> {tz.replace("_", " ")} · {num(minutes)} {d.booking.min}
          </span>
        </div>
        <SlotPicker tz={tz} value={slot} onChange={setSlot} reloadKey={reloadKey} onMinutes={setMinutes} />
      </div>

      <form onSubmit={onSubmit} noValidate className="surface relative space-y-4 p-6 md:p-8">
        <Honeypot />
        <h2 className="text-lg font-semibold">{d.booking.details}</h2>
        {slot ? <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{fmtFull(slot)}</p> : <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">{d.booking.selectLeft}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.form.fullName} required error={errors.name}>
            <Input name="name" autoComplete="name" required maxLength={120} />
          </Field>
          <Field label={d.form.workEmail} required error={errors.email}>
            <Input name="email" type="email" autoComplete="email" required maxLength={254} dir="ltr" />
          </Field>
          <Field label={d.form.phone} error={errors.phone}>
            <Input name="phone" type="tel" autoComplete="tel" maxLength={30} dir="ltr" />
          </Field>
          <Field label={d.form.company} error={errors.company}>
            <Input name="company" autoComplete="organization" maxLength={160} />
          </Field>
        </div>
        <Field label={d.booking.discuss} error={errors.topic}>
          <Select name="topic" options={services} labels={d.options.services} placeholder={d.form.select} />
        </Field>
        <Field label={d.booking.anything} error={errors.notes}>
          <Textarea name="notes" maxLength={2000} placeholder={d.booking.notesPlaceholder} className="min-h-20" />
        </Field>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
          <span>
            {d.booking.agree}{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              {d.booking.privacy}
            </Link>
            {lang === "bn" ? " ।" : "."}
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-xs text-destructive">
            {errors.consent}
          </p>
        )}
        {formError && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={status === "sending" || !slot}>
          {status === "sending" ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
          {status === "sending" ? d.booking.booking : d.booking.confirm}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{d.booking.free}</p>
      </form>
    </div>
  );
}
