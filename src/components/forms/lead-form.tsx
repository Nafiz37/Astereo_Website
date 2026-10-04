"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { budgets, services, timelines } from "@/content/site";
import { useDict, useLang } from "@/i18n/client";
import { Field, Honeypot, Input, Select, Textarea } from "./fields";

type LeadType = "contact" | "sales" | "partner" | "career";

type Props = {
  type: LeadType;
  /** Fields to show beyond name/email/message. `role.options` values are submitted as-is; `role.labels` only affect display. */
  show?: {
    phone?: boolean;
    company?: boolean;
    service?: boolean;
    budget?: boolean;
    timeline?: boolean;
    role?: { label: string; options?: readonly string[]; labels?: Record<string, string> };
    link?: { label: string; hint?: string; required?: boolean };
  };
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  defaults?: Partial<Record<"role" | "service", string>>;
};

export function LeadForm({ type, show = {}, messageLabel, messagePlaceholder, submitLabel, successTitle, successBody, defaults }: Props) {
  const d = useDict();
  const lang = useLang();
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = { type, consent: fd.get("consent") === "on", source: typeof window !== "undefined" ? window.location.pathname : undefined };
    fd.forEach((v, k) => {
      if (k !== "consent" && typeof v === "string") body[k] = v;
    });
    setStatus("sending");
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json", "x-lang": lang }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("done");
        form.reset();
        return;
      }
      setErrors(json.fields ?? {});
      setFormError(json.fields ? "" : (json.error ?? d.form.errGeneric));
      setStatus("error");
    } catch {
      setFormError(d.form.errNetwork);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="surface flex flex-col items-center gap-3 p-10 text-center" role="status">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <h3 className="text-xl font-semibold">{successTitle ?? d.form.successTitle}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{successBody ?? d.form.successBody}</p>
        <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
          {d.form.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="surface relative space-y-4 p-6 md:p-8" aria-describedby={formError ? "form-error" : undefined}>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.form.fullName} required error={errors.name}>
          <Input name="name" autoComplete="name" required maxLength={120} />
        </Field>
        <Field label={d.form.workEmail} required error={errors.email}>
          <Input name="email" type="email" autoComplete="email" required maxLength={254} dir="ltr" />
        </Field>
        {show.phone && (
          <Field label={d.form.phone} error={errors.phone}>
            <Input name="phone" type="tel" autoComplete="tel" maxLength={30} dir="ltr" />
          </Field>
        )}
        {show.company && (
          <Field label={d.form.company} error={errors.company}>
            <Input name="company" autoComplete="organization" maxLength={160} />
          </Field>
        )}
        {show.role && (
          <Field label={show.role.label} error={errors.role}>
            {show.role.options ? <Select name="role" options={show.role.options} labels={show.role.labels} placeholder={d.form.select} defaultValue={defaults?.role ?? ""} /> : <Input name="role" defaultValue={defaults?.role ?? ""} maxLength={160} />}
          </Field>
        )}
        {show.service && (
          <Field label={d.form.whatNeed} error={errors.service}>
            <Select name="service" options={services} labels={d.options.services} placeholder={d.form.select} defaultValue={defaults?.service ?? ""} />
          </Field>
        )}
        {show.budget && (
          <Field label={d.form.budget} error={errors.budget}>
            <Select name="budget" options={budgets} labels={d.options.budgets} placeholder={d.form.select} />
          </Field>
        )}
        {show.timeline && (
          <Field label={d.form.timeline} error={errors.timeline}>
            <Select name="timeline" options={timelines} labels={d.options.timelines} placeholder={d.form.select} />
          </Field>
        )}
        {show.link && (
          <Field label={show.link.label} hint={show.link.hint} required={show.link.required} error={errors.link} className="sm:col-span-2">
            <Input name="link" type="url" inputMode="url" placeholder="https://" maxLength={500} required={show.link.required} dir="ltr" />
          </Field>
        )}
      </div>
      <Field label={messageLabel ?? d.form.howHelp} required error={errors.message}>
        <Textarea name="message" required minLength={10} maxLength={4000} placeholder={messagePlaceholder ?? d.form.messagePlaceholder} />
      </Field>
      <div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]" />
          <span>
            {d.form.consentPre}{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              {d.form.consentLink}
            </Link>{" "}
            {d.form.consentPost}
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {errors.consent}
          </p>
        )}
      </div>
      {formError && (
        <p id="form-error" role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
        {status === "sending" ? d.form.sending : (submitLabel ?? d.form.send)}
      </Button>
    </form>
  );
}
