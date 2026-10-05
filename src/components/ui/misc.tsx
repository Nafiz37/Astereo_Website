import Link from "@/components/ui/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { localizeHref } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";

/** Safely embeds JSON-LD (escapes "<" so content can never close the script tag). */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export async function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: d.breadcrumb.home, href: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      ...(it.href ? { item: `${site.url}${localizeHref(it.href, lang)}` } : {}),
    })),
  };
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          {d.breadcrumb.home}
        </Link>
        {items.map((it) => (
          <span key={it.label} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {it.href ? (
              <Link href={it.href} className="hover:text-primary">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground/80">
                {it.label}
              </span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd data={ld} />
    </>
  );
}

export function Faq({ items, withSchema = true }: { items: readonly { q: string; a: string }[]; withSchema?: boolean }) {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((f) => (
        <details key={f.q} className="surface group p-5 open:border-primary/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
      {withSchema && <JsonLd data={ld} />}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`surface p-6 ${className}`}>{children}</div>;
}
