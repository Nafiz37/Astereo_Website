import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { CaseStudyCard } from "@/components/home/case-study-card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "@/components/ui/link";
import { Breadcrumbs, Faq, JsonLd } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero, SectionHeader } from "@/components/ui/section";
import { solutions } from "@/content/solutions";
import { site } from "@/content/site";
import { localizeHref } from "@/i18n/config";
import { caseStudiesFor, getIndustryFor, getSolutionFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => solutions.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lang = await getLang();
  const s = getSolutionFor((await params).slug, lang);
  return s ? buildMetadata({ title: s.name, description: `${s.tagline}. ${s.summary}`, path: `/solutions/${s.slug}` }, lang) : {};
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, lang, { slug }] = await Promise.all([getDict(), getLang(), params]);
  const s = getSolutionFor(slug, lang);
  if (!s) notFound();
  const p = d.pages.solutionDetail;
  const related = caseStudiesFor(lang).filter((c) => c.solution === s.slug);
  const industriesFor = s.industries.map((i) => getIndustryFor(i, lang)).filter((i) => !!i);

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.overview,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: "Worldwide",
    url: `${site.url}${localizeHref(`/solutions/${s.slug}`, lang)}`,
  };

  return (
    <>
      <PageHero eyebrow={s.isNew ? p.eyebrowNew : p.eyebrow} title={s.name} description={s.tagline}>
        <ButtonLink href="/get-started" size="lg">{d.common.scheduleConsultation}</ButtonLink>
        <ButtonLink href="/contact" variant="ghost" size="lg">{p.askQuestion}</ButtonLink>
      </PageHero>

      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.solutions, href: "/solutions" }, { label: s.name }]} />
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{p.overview}</p>
              <p className="text-lg leading-8 text-foreground/85">{s.overview}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {s.badges.map((b) => (
                  <li key={b} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{b}</li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60">
              <Image src={s.image} alt={s.name} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
            </div>
          </div>
        </Container>
      </section>

      <section className="section bg-card/30">
        <Container>
          <SectionHeader eyebrow={p.capabilities} title={p.whatWeBuild} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {s.features.map((f) => (
              <div key={f.title} className="surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="surface p-6">
            <h3 className="text-lg font-semibold">{p.useCases}</h3>
            <ul className="mt-4 space-y-2.5">
              {s.useCases.map((u) => (
                <li key={u} className="flex gap-2 text-sm text-foreground/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{u}</li>
              ))}
            </ul>
          </div>
          <div className="surface p-6">
            <h3 className="text-lg font-semibold">{p.receive}</h3>
            <ul className="mt-4 space-y-2.5">
              {s.deliverables.map((u) => (
                <li key={u} className="flex gap-2 text-sm text-foreground/85"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{u}</li>
              ))}
            </ul>
          </div>
          <div className="surface p-6">
            <h3 className="text-lg font-semibold">{p.tech}</h3>
            <ul className="mt-4 flex flex-wrap gap-2" dir="ltr">
              {s.tech.map((t) => (
                <li key={t} className="rounded-lg bg-secondary px-3 py-1.5 text-sm">{t}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{p.techNote}</p>
          </div>
        </Container>
      </section>

      {industriesFor.length > 0 && (
        <section className="section pt-0">
          <Container>
            <h2 className="mb-5 text-2xl font-semibold">{p.industriesTitle}</h2>
            <ul className="flex flex-wrap gap-3">
              {industriesFor.map((i) => (
                <li key={i!.slug}>
                  <Link href={`/industries/${i!.slug}`} className="surface surface-hover inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                    <span aria-hidden="true">{i!.emoji}</span> {i!.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className="section pt-0">
          <Container>
            <h2 className="mb-6 text-2xl font-semibold">{p.related}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CaseStudyCard key={c.slug} cs={c} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="section pt-0">
        <Container>
          <SectionHeader eyebrow={d.faq.eyebrow} title={`${s.navName}: ${p.faqSuffix}`} />
          <Faq items={s.faqs} />
        </Container>
      </section>
      <PageCta title={d.pageCta.solutionTitle.replace("{name}", lang === "bn" ? s.navName : s.navName.toLowerCase())} />
      <JsonLd data={service} />
    </>
  );
}
