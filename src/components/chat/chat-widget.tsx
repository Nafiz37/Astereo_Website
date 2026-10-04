"use client";

import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import Link from "@/components/ui/link";
import { useDict, useLang } from "@/i18n/client";
import { cn } from "@/lib/utils";

type Msg = { id: number; role: "user" | "assistant"; text: string };

const STORE = "astareo-chat-v1";

function loadSaved(): { sessionId?: string; messages: Msg[] } {
  if (typeof window === "undefined") return { messages: [] };
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) {
      const s = JSON.parse(raw) as { sessionId?: string; messages?: Msg[] };
      return { sessionId: s.sessionId, messages: Array.isArray(s.messages) ? s.messages : [] };
    }
  } catch {
    /* storage unavailable */
  }
  return { messages: [] };
}

/** Minimal, safe formatter: **bold**, "- " bullets, links and internal paths. No HTML injection. */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|\/(?:bn\/)?(?:get-started|contact|pricing|solutions|industries|case-studies|blog|careers|about|partners)[\w/-]*|[\w.+-]+@[\w-]+\.[\w.-]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("http")) out.push(<a key={i++} href={t} target="_blank" rel="noopener noreferrer" className="text-primary underline">{t}</a>);
    else if (t.startsWith("/")) out.push(<Link key={i++} href={t.replace(/^\/bn(?=\/)/, "")} className="text-primary underline">{t}</Link>);
    else out.push(<a key={i++} href={`mailto:${t}`} className="text-primary underline">{t}</a>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Formatted({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      const items = bullets;
      blocks.push(
        <ul key={`u${blocks.length}`} className="my-1 list-disc space-y-0.5 pl-5">
          {items.map((b, i) => (
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };
  lines.forEach((l, idx) => {
    const b = l.match(/^\s*[-*•]\s+(.*)$/);
    if (b) bullets.push(b[1]);
    else {
      flush();
      if (l.trim()) blocks.push(<p key={`p${idx}`} className="my-1">{renderInline(l)}</p>);
    }
  });
  flush();
  return <Fragment>{blocks}</Fragment>;
}

export function ChatWidget() {
  const pathname = usePathname();
  const d = useDict();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  // Restore the conversation (browser-local only). The panel is closed on first render, so this never affects hydration markup.
  const [saved] = useState(loadSaved);
  const [messages, setMessages] = useState<Msg[]>(saved.messages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolLabel, setToolLabel] = useState("");
  const sessionRef = useRef<string | undefined>(saved.sessionId);
  const idRef = useRef(Math.max(0, ...saved.messages.map((m) => m.id)));
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (messages.length) localStorage.setItem(STORE, JSON.stringify({ sessionId: sessionRef.current, messages: messages.slice(-60) }));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, toolLabel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1000);
      if (!text || busy) return;
      const uid = ++idRef.current;
      const aid = ++idRef.current;
      setMessages((m) => [...m, { id: uid, role: "user", text }, { id: aid, role: "assistant", text: "" }]);
      setInput("");
      setBusy(true);
      setToolLabel("");
      abortRef.current = new AbortController();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({ sessionId: sessionRef.current, message: text, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, page: pathname, lang }),
        });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Request failed");
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        const apply = (line: string) => {
          if (!line.trim()) return;
          const e = JSON.parse(line) as { t: string; id?: string; d?: string; name?: string; message?: string };
          if (e.t === "session" && e.id) sessionRef.current = e.id;
          else if (e.t === "text" && e.d) {
            setToolLabel("");
            setMessages((m) => m.map((x) => (x.id === aid ? { ...x, text: x.text + e.d } : x)));
          } else if (e.t === "tool" && e.name) setToolLabel(d.chat.tools[e.name] ?? "…");
          else if (e.t === "error") setMessages((m) => m.map((x) => (x.id === aid ? { ...x, text: e.message ?? d.chat.offline } : x)));
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          lines.forEach(apply);
        }
        if (buf) apply(buf);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((m) => m.map((x) => (x.id === aid ? { ...x, text: x.text || d.chat.offline } : x)));
        }
      } finally {
        setMessages((m) => m.map((x) => (x.id === aid && !x.text ? { ...x, text: d.chat.noReply } : x)));
        setBusy(false);
        setToolLabel("");
      }
    },
    [busy, pathname, lang, d],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    abortRef.current?.abort();
    sessionRef.current = undefined;
    setMessages([]);
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label={d.chat.openAria} className="fixed bottom-5 right-5 z-[60] flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-brand-purple px-5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_hsl(var(--primary)/0.7)] transition-transform hover:scale-105">
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">{d.chat.open}</span>
        </button>
      )}
      {open && (