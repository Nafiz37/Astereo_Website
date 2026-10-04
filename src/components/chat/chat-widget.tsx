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
        <section role="dialog" aria-label={d.chat.title} className="fixed inset-x-3 bottom-3 z-[60] flex h-[min(640px,calc(100vh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px]">
          <header className="flex items-center justify-between bg-gradient-to-r from-primary/25 to-brand-purple/25 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">{d.chat.title}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {d.chat.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button type="button" onClick={reset} className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                  {d.chat.newChat}
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label={d.chat.close} className="rounded p-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-4 w-4 text-primary" /> {d.chat.greeting}
                  </p>
                  <p className="mt-1 text-muted-foreground">{d.chat.intro}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.chat.suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-primary/40 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.role === "user" ? "rounded-br-sm bg-primary text-white" : "rounded-tl-sm bg-secondary")}>
                  {m.text ? (
                    m.role === "user" ? (
                      m.text
                    ) : (
                      <Formatted text={m.text} />
                    )
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {toolLabel || d.chat.thinking}
                    </span>
                  )}
                  {m.text && busy && m.id === messages[messages.length - 1]?.id && toolLabel && <span className="mt-1 block text-xs text-muted-foreground">{toolLabel}</span>}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <label className="flex-1">
                <span className="sr-only">{d.chat.send}</span>
                <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder={d.chat.placeholder} disabled={busy} className="field" autoComplete="off" />
              </label>
              <button type="submit" disabled={busy || !input.trim()} aria-label={d.chat.send} className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:bg-primary/90 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {d.chat.disclaimer}{" "}
              <Link href="/privacy" className="underline">
                {d.chat.privacy}
              </Link>
            </p>
          </form>
        </section>
      )}
    </>
  );
}
