"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { SearchItem } from "@/lib/search-index";
import { localizeHref } from "@/i18n/config";
import { useDict, useLang } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Fetched once per language and shared by every time the dialog opens. */
const cache = new Map<string, Promise<SearchItem[]>>();
const loadIndex = (lang: string) => {
  if (!cache.has(lang)) cache.set(lang, fetch(`/api/search?lang=${lang}`).then((r) => r.json() as Promise<SearchItem[]>).catch(() => []));
  return cache.get(lang)!;
};

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // The panel mounts only while open, so its state (query, selection) resets naturally.
  return open ? <SearchPanel onClose={onClose} /> : null;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const d = useDict();
  const lang = useLang();
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    let live = true;
    void loadIndex(lang).then((r) => live && setItems(r));
    return () => {
      live = false;
    };
  }, [lang]);

  const results = useMemo(() => {
    if (!items) return [];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return items.filter((i) => ["Solution", "Page"].includes(i.type)).slice(0, 8);
    return items
      .map((i) => {
        const title = i.title.toLowerCase();
        const hay = `${title} ${i.desc} ${i.keywords} ${i.type}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return null;
        const score = terms.reduce((s, t) => s + (title.includes(t) ? 3 : 0) + (title.startsWith(t) ? 2 : 0) + 1, 0);
        return { i, score };
      })
      .filter((x): x is { i: SearchItem; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.i);
  }, [items, q]);

  const go = (href: string) => {
    onClose();
    router.push(localizeHref(href, lang));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={d.nav.search} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                go(results[active].href);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder={d.search.placeholder}
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={d.search.placeholder}
          />
          <button type="button" onClick={onClose} aria-label={d.search.close} className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>