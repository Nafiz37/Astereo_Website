"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Select that PATCHes `{ [field]: value }` to an admin endpoint, then refreshes server data. */
export function InlineSelect({ endpoint, field, value, options }: { endpoint: string; field: string; value: string; options: readonly string[] }) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={field}
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        const prev = current;
        setCurrent(next);
        setError(false);
        start(async () => {
          const res = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: next }) });
          if (!res.ok) {
            setCurrent(prev);
            setError(true);
          } else router.refresh();
        });
      }}
      className={`rounded-md border bg-secondary px-2 py-1 text-xs ${error ? "border-destructive" : "border-input"}`}
    >
      {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
    </select>
  );
}

export function NotesEditor({ endpoint, value }: { endpoint: string; value: string }) {
  const router = useRouter();
  const [text, setText] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  return (
    <div className="space-y-2">
      <textarea value={text} onChange={(e) => { setText(e.target.value); setState("idle"); }} maxLength={4000} rows={3} placeholder="Internal notes…" className="field text-xs" aria-label="Internal notes" />
      <button
        type="button"
        disabled={state === "saving" || text === value}
        onClick={async () => {
          setState("saving");
          const res = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: text }) });
          setState(res.ok ? "saved" : "error");
          if (res.ok) router.refresh();
        }}
        className="rounded-md bg-primary px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : state === "error" ? "Failed - retry" : "Save notes"}
      </button>
    </div>
  );
}
