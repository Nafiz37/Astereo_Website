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
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key++}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
    } else if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++}>{inline(line.slice(4))}</h3>);
      i++;
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++}>{inline(line.slice(3))}</h2>);
      i++;
    } else if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(
        <ul key={key++}>
          {items.map((t, n) => (
            <li key={n}>{inline(t)}</li>
          ))}
        </ul>,
      );
    } else if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
      blocks.push(
        <ol key={key++}>
          {items.map((t, n) => (
            <li key={n}>{inline(t)}</li>
          ))}
        </ol>,
      );
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |```|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) para.push(lines[i++]);
      blocks.push(<p key={key++}>{inline(para.join(" "))}</p>);
    }
  }
  return (
    <div className="prose-astareo">
      <Fragment>{blocks}</Fragment>
    </div>
  );
}
