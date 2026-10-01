import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Info } from "lucide-react";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero } from "@/components/ui/section";
import { caseStudies } from "@/content/case-studies";
import { toBanglaDigits } from "@/i18n/config";
import { getCaseStudyFor, getSolutionFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => caseStudies.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lang = await getLang();
  const c = getCaseStudyFor((await params).slug, lang);
  return c ? buildMetadata({ title: c.title, description: `${c.challenge} ${c.solutionSummary}`, path: `/case-studies/${c.slug}` }, lang) : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, lang, { slug }] = await Promise.all([getDict(), getLang(), params]);
  const c = getCaseStudyFor(slug, lang);
  if (!c) notFound();
  const p = d.pages.caseDetail;
  const sol = getSolutionFor(c.solution, lang);

  return (
    <>
      <PageHero eyebrow={`${c.verified ? p.eyebrowVerified : p.eyebrowExample} · ${c.industry}`} title={c.title} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/case-studies"].label, href: "/case-studies" }, { label: c.title }]} />
          {!c.verified && (
            <div className="mb-8 flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/80" role="note">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>{p.notice}</p>
            </div>
          )}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-8">
              <div>
                <h2 className="eyebrow mb-2">{p.challenge}</h2>
                <p className="text-lg leading-8">{c.challenge}</p>
              </div>
              <div>
                <h2 className="eyebrow mb-2">{p.solution}</h2>
                <p className="text-lg leading-8">{c.solutionSummary}</p>
              </div>
              <div>
                <h2 className="eyebrow mb-3">{p.approach}</h2>
                <ul className="space-y-2.5">
                  {c.approach.map((a) => (
                    <li key={a} className="flex gap-2.5 text-foreground/85"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{a}</li>
                  ))}
                </ul>
              </div>
              {c.verified && c.metrics.length > 0 && (
                <div>
                  <h2 className="eyebrow mb-3">{p.results}</h2>
                  <ul className="flex flex-wrap gap-8">
                    {c.metrics.map((m) => (
                      <li key={m.label}>
                        <p className="gradient-text text-4xl font-bold">{lang === "bn" ? toBanglaDigits(m.value) : m.value}</p>
                        <p className="text-sm text-muted-foreground">{m.label}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <aside className="space-y-5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60">
                <Image src={c.image} alt={c.title} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" priority />
              </div>
              <div className="surface p-5">
                <h3 className="font-semibold">{p.deliverables}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">{c.deliverables.map((x) => <li key={x}>• {x}</li>)}</ul>
              </div>
              <div className="surface p-5">
                <h3 className="font-semibold">{p.technology}</h3>
                <ul className="mt-3 flex flex-wrap gap-2" dir="ltr">{c.tech.map((t) => <li key={t} className="rounded-lg bg-secondary px-3 py-1 text-sm">{t}</li>)}</ul>
              </div>
              {sol && (
                <Link href={`/solutions/${sol.slug}`} className="surface surface-hover block p-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.relatedSolution}</p>
                  <p className="mt-1 font-semibold text-primary">{sol.name} →</p>
                </Link>
              )}
            </aside>
          </div>
        </Container>
      </section>
      <PageCta />
    </>
  );
}
