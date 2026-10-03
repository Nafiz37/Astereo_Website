import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, Faq } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero, SectionHeader } from "@/components/ui/section";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.pricing.metaTitle, description: d.pages.pricing.metaDesc, path: "/pricing" }));

export default async function PricingPage() {
  const d = await getDict();
  const p = d.pages.pricing;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.pricing }]} />
          <div className="grid gap-6 lg:grid-cols-3">
            {p.models.map((m, i) => {
              const featured = i === 1;
              return (
                <article key={m.name} className={cn("surface relative flex flex-col p-8", featured && "border-primary/60 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.5)]")}>
                  {featured && <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-primary to-brand-purple px-3 py-1 text-xs font-semibold text-white">{m.tag}</span>}
                  {!featured && <p className="eyebrow">{m.tag}</p>}
                  <h2 className="mt-2 text-2xl font-semibold">{m.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
                  <p className="mt-6 text-3xl font-bold">{p.customQuote}</p>
                  <p className="text-xs text-muted-foreground">{p.afterAssessment}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {m.points.map((pt) => <li key={pt} className="flex gap-2.5 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{pt}</li>)}
                  </ul>
                  <ButtonLink href="/get-started" variant={featured ? "primary" : "outline"} className="mt-8">{p.cta}</ButtonLink>
                </article>
              );