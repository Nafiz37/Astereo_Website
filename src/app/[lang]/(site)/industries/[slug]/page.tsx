import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { CaseStudyCard } from "@/components/home/case-study-card";
import { ButtonLink } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero } from "@/components/ui/section";
import { industries } from "@/content/industries";
import { caseStudiesFor, getIndustryFor, getSolutionFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => industries.map((i) => ({ slug: i.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [d, lang, { slug }] = await Promise.all([getDict(), getLang(), params]);
  const i = getIndustryFor(slug, lang);
  return i ? buildMetadata({ title: `${i.name} ${d.pages.industryDetail.metaSuffix}`, description: `${i.headline}. ${i.overview}`, path: `/industries/${i.slug}` }, lang) : {};
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, lang, { slug }] = await Promise.all([getDict(), getLang(), params]);
  const i = getIndustryFor(slug, lang);
  if (!i) notFound();
  const p = d.pages.industryDetail;
  const related = caseStudiesFor(lang).filter((c) => i.offerings.some((o) => o.solution === c.solution)).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={`${p.eyebrow} · ${i.name}`} title={i.headline}>
        <ButtonLink href="/get-started" size="lg">{d.common.scheduleConsultation}</ButtonLink>
      </PageHero>

      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.industries, href: "/industries" }, { label: i.name }]} />
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{d.pages.solutionDetail.overview}</p>
              <p className="text-lg leading-8 text-foreground/85">{i.overview}</p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60">
              <Image src={i.image} alt={i.name} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
            </div>
          </div>
        </Container>
      </section>

      <section className="section bg-card/30">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold"><AlertTriangle className="h-5 w-5 text-primary" /> {p.challenges}</h2>
            <ul className="mt-5 space-y-3">
              {i.challenges.map((c) => (
                <li key={c} className="surface px-4 py-3 text-sm">{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{p.howWeHelp}</h2>
            <ul className="mt-5 space-y-3">
              {i.offerings.map((o) => {
                const sol = getSolutionFor(o.solution, lang);
                return (
                  <li key={o.solution}>
                    <Link href={`/solutions/${o.solution}`} className="surface surface-hover group flex items-start justify-between gap-3 px-4 py-3">
                      <span>
                        <span className="block font-semibold">{sol?.name}</span>
                        <span className="block text-sm text-muted-foreground">{o.how}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="surface flex gap-4 border-primary/30 p-6">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold">{p.considerations}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{i.considerations}</p>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="section pt-0">
          <Container>
            <h2 className="mb-6 text-2xl font-semibold">{p.related}</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => <CaseStudyCard key={c.slug} cs={c} />)}
            </div>
          </Container>
        </section>
      )}
      <PageCta title={d.pageCta.industryTitle.replace("{name}", lang === "bn" ? i.name : i.name.toLowerCase())} />
    </>
  );
}
