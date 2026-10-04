import Image from "next/image";
import Link from "@/components/ui/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { solutionsFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";

export async function SolutionsGrid({ withHeader = true }: { withHeader?: boolean }) {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const [featured, ...rest] = solutionsFor(lang);
  return (
    <section id="solutions" className="section" aria-labelledby="solutions-title">
      <Container>
        {withHeader && <SectionHeader eyebrow={d.solutionsSection.eyebrow} title={<span id="solutions-title">{d.solutionsSection.title}</span>} />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2 lg:row-span-2">
            <Link href={`/solutions/${featured.slug}`} className="surface surface-hover group flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={featured.image} alt={featured.name} fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <div className="flex flex-wrap gap-2">
                  {featured.badges.map((b) => (
                    <span key={b} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {b}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-2xl font-semibold">{featured.name}</h3>
                <p className="mt-2 flex-1 text-muted-foreground">{featured.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {d.common.learnMore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
          {rest.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link href={`/solutions/${s.slug}`} className="surface surface-hover group relative flex h-full flex-col p-6">
                {s.isNew && <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary to-brand-purple px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{d.common.new}</span>}
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {d.common.learnMore} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        {withHeader && (
          <div className="mt-10 text-center">
            <ButtonLink href="/get-started" variant="outline">
              {d.solutionsSection.cta}
            </ButtonLink>
          </div>
        )}
      </Container>
    </section>
  );
}
