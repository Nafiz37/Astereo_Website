"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CalendarClock, CheckCircle2, Globe, Loader2, XCircle } from "lucide-react";
import { SlotPicker } from "@/components/forms/slot-picker";
import { Button, ButtonLink } from "@/components/ui/button";
import { toBanglaDigits } from "@/i18n/config";
import { useDict, useLang } from "@/i18n/client";

type View = { name: string; startsAt: string; durationMin: number; status: string; rescheduleCount: number; canReschedule: boolean; cutoffHours: number; isPast: boolean };
type Mode = "view" | "reschedule" | "cancel" | "rescheduled" | "cancelled";

export function ManageClient({ id, token }: { id: string; token: string }) {
  const d = useDict();
  const p = d.pages.manage;
  const lang = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const tz = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    () => "UTC",
  );
  const [view, setView] = useState<View | null>(null);
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState<Mode>("view");
  const [slot, setSlot] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emailed, setEmailed] = useState(true);

  const valid = Boolean(id && token);
  useEffect(() => {
    if (!valid) return;
    let live = true;
    fetch(`/api/consultation/manage?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => ({ ok: r.ok, json: await r.json().catch(() => ({})) }))
      .then(({ ok, json }) => {
        if (!live) return;
        if (ok && json.booking) setView(json.booking);
        else setMissing(true);
      })
      .catch(() => live && setMissing(true));
    return () => {
      live = false;
    };
  }, [id, token, valid]);

  const full = (iso: string) => new Intl.DateTimeFormat(loc, { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(new Date(iso));
  const count = (n: number) => (lang === "bn" ? toBanglaDigits(n) : String(n));

  async function call(path: string, body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      setBusy(false);
      return { ok: res.ok && json.ok, json, status: res.status };
    } catch {
      setBusy(false);
      setError(p.network);
      return { ok: false, json: {}, status: 0 };
    }
  }

  async function doReschedule() {
    if (!slot) return;
    const r = await call("/api/consultation/reschedule", { id, token, startsAt: slot });
    if (r.ok) {
      setEmailed(r.json.emailed !== false);
      setView((v) => (v ? { ...v, startsAt: r.json.booking.startsAt, rescheduleCount: r.json.booking.rescheduleCount } : v));
      setMode("rescheduled");
      return;
    }
    if (r.status === 0) return;
    setError(p.errors[r.json.reason as string] ?? p.failed);
    if (r.status === 409) {
      setSlot(null);
      setReloadKey((k) => k + 1);
    }
  }

  async function doCancel() {
    const r = await call("/api/consultation/cancel", { id, token });
    if (r.ok) {
      setMode("cancelled");
      return;
    }
    if (r.status !== 0) setError(p.errors.not_active);
  }

  if (!valid) return <p className="surface p-6 text-sm text-muted-foreground">{p.incomplete}</p>;
  if (missing) return <p className="surface p-6 text-sm text-muted-foreground">{p.notFound}</p>;
  if (!view)
    return (
      <div className="surface flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {p.loading}
      </div>
    );

  if (mode === "cancelled")
    return (
      <div className="surface p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="mt-3 text-xl font-semibold">{p.cancelDoneTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{p.cancelDoneBody}</p>
        <ButtonLink href="/get-started" className="mt-5">
          {p.bookNew}
        </ButtonLink>
      </div>
    );

  if (mode === "rescheduled")
    return (
      <div className="surface p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="mt-3 text-xl font-semibold">{p.reschedDoneTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{emailed ? p.reschedDoneBody : p.reschedDoneNoEmail}</p>
        <p className="mt-4 text-lg font-medium text-primary">{full(view.startsAt)}</p>
        <p className="text-xs text-muted-foreground">{tz.replace("_", " ")}</p>
        <Button variant="ghost" className="mt-6" onClick={() => setMode("view")}>
          {p.back}
        </Button>
      </div>
    );

  const active = view.status === "confirmed" && !view.isPast;

  return (
    <div className="space-y-6">
      <div className="surface p-6 md:p-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.yourBooking}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {p.hello} {view.name}
        </p>
        <p className="mt-1 text-xl font-semibold text-primary">{full(view.startsAt)}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" /> {tz.replace("_", " ")}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium ${view.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{p.status[view.status] ?? view.status}</span>
          {view.rescheduleCount > 0 && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
              {p.rescheduledTimes} × {count(view.rescheduleCount)}
            </span>
          )}
        </div>

        {!active && <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><XCircle className="h-4 w-4" /> {view.isPast && view.status === "confirmed" ? p.past : p.inactive}</p>}

        {active && mode === "view" && (
          <>
            <div className="mt-6 flex flex-wrap gap-3">
              {view.canReschedule && (
                <Button onClick={() => { setMode("reschedule"); setError(""); }}>
                  <CalendarClock /> {p.reschedule}
                </Button>
              )}
              <Button variant="ghost" onClick={() => { setMode("cancel"); setError(""); }}>
                {p.cancel}
              </Button>
            </div>
            {!view.canReschedule && <p className="mt-4 text-xs text-muted-foreground">{p.cutoff.replace("{hours}", count(view.cutoffHours))}</p>}
          </>
        )}

        {active && mode === "cancel" && (
          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="text-sm">{p.cancelQ}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={doCancel} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} {busy ? p.cancelling : p.yesCancel}
              </Button>
              <Button variant="ghost" onClick={() => setMode("view")} disabled={busy}>
                {p.keep}
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {active && mode === "reschedule" && (
        <div className="surface p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold">{p.pickNew}</h2>
          <SlotPicker tz={tz} value={slot} onChange={setSlot} reloadKey={reloadKey} hideIso={view.startsAt} />
          {slot && (
            <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              {p.newTime}: {full(slot)}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={doReschedule} disabled={!slot || busy}>
              {busy ? <Loader2 className="animate-spin" /> : <CalendarClock />} {busy ? p.moving : p.confirmMove}
            </Button>
            <Button variant="ghost" onClick={() => { setMode("view"); setSlot(null); setError(""); }} disabled={busy}>
              {p.back}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
