"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(json.error ?? "Sign-in failed.");
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="surface space-y-4 p-6">
      <Field label="Email"><Input name="email" type="email" autoComplete="username" required /></Field>
      <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Sign in</Button>
    </form>
  );
}
