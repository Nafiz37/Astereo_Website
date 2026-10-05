import Link from "@/components/ui/link";
import { Fragment, type ReactNode } from "react";

/** Tiny, dependency-free Markdown subset renderer (headings, lists, code, bold, inline code, links). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("*")) out.push(<em key={i++}>{t.slice(1, -1)}</em>);
    else if (t.startsWith("`")) out.push(<code key={i++}>{t.slice(1, -1)}</code>);
    else {
      const lm = t.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = lm[2];
      const safe = /^(https?:\/\/|\/|mailto:)/.test(href);
      if (!safe) out.push(lm[1]);
      else if (href.startsWith("/")) out.push(<Link key={i++} href={href}>{lm[1]}</Link>);
      else out.push(<a key={i++} href={href} target="_blank" rel="noopener noreferrer">{lm[1]}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Prose({ children }: { children: string }) {
  const lines = children.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];