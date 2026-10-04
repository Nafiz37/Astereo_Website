"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import Link from "@/components/ui/link";
import { useDict, useLang } from "@/i18n/client";
import { cn } from "@/lib/utils";

type SlotsResponse = { ok: boolean; slots: string[]; slotMinutes: number; timezone: string };

const dayKey = (iso: string, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

/**
 * Day tabs + time buttons for choosing a consultation slot, shown in the visitor's timezone.
 * Used by the booking form and by "reschedule". Bump `reloadKey` to refetch availability.
 */
export function SlotPicker({ tz, value, onChange, reloadKey = 0, hideIso, onMinutes }: { tz: string; value: string | null; onChange: (iso: string | null) => void; reloadKey?: number; hideIso?: string; onMinutes?: (min: number) => void }) {
  const d = useDict();
  const lang = useLang();
  const loc = lang === "bn" ? "bn-BD" : "en-US";
  const [data, setData] = useState<SlotsResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [day, setDay] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/consultation/slots", { cache: "no-store" })
      .then((r) => r.json() as Promise<SlotsResponse>)
      .then((json) => {
        if (!live) return;
        setData(json);
        setLoadError(false);
        onMinutes?.(json.slotMinutes);
      })
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, [reloadKey, retry, onMinutes]);

  const byDay = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const iso of data?.slots ?? []) {
      if (iso === hideIso) continue;
      const k = dayKey(iso, tz);
      m.set(k, [...(m.get(k) ?? []), iso]);
    }
    return m;
  }, [data, tz, hideIso]);

  const days = useMemo(() => [...byDay.keys()], [byDay]);
  const activeDay = day && byDay.has(day) ? day : (days[0] ?? null);
  const times = activeDay ? (byDay.get(activeDay) ?? []) : [];

  const fmtDay = (k: string) => {
    const dt = new Date(`${k}T12:00:00Z`);
    return { wd: new Intl.DateTimeFormat(loc, { weekday: "short", timeZone: "UTC" }).format(dt), md: new Intl.DateTimeFormat(loc, { month: "short", day: "numeric", timeZone: "UTC" }).format(dt) };
  };
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(loc, { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

  if (!data && !loadError)
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {d.booking.loading}
      </div>
    );
  if (loadError)
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {d.booking.loadError}{" "}
        <button type="button" className="underline" onClick={() => setRetry((n) => n + 1)}>
          {d.booking.retry}
        </button>{" "}
        {d.booking.or}{" "}
        <Link href="/contact" className="underline">
          {d.booking.contactUs}
        </Link>
        .
      </p>
    );
  if (days.length === 0)
    return (
      <p className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
        {d.booking.noSlots}{" "}
        <Link href="/contact" className="text-primary underline">
          {d.booking.noSlotsLink}
        </Link>{" "}
        {d.booking.noSlotsPost}
      </p>
    );

  return (
    <>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3" role="tablist" aria-label={d.booking.availableDays}>
        {days.map((k) => {
          const f = fmtDay(k);
          const selected = k === activeDay;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-label={`${f.wd}, ${f.md}`}
              aria-selected={selected}
              onClick={() => {
                setDay(k);
                onChange(null);
              }}
              className={cn("min-w-[64px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition-colors", selected ? "border-primary bg-primary/15 text-primary" : "border-border hover:border-primary/50")}
            >
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{f.wd}</span>
              <span className="block text-sm font-semibold">{f.md}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" role="listbox" aria-label={d.booking.availableTimes}>
        {times.map((iso) => (
          <button key={iso} type="button" role="option" aria-selected={value === iso} onClick={() => onChange(iso)} className={cn("flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm transition-colors", value === iso ? "border-primary bg-primary text-white" : "border-border hover:border-primary/60 hover:bg-primary/10")}>
            <Clock className="h-3.5 w-3.5 opacity-70" /> {fmtTime(iso)}
          </button>
        ))}
      </div>
    </>
  );
}
