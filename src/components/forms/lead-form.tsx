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