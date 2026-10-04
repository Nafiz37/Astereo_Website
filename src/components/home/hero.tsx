import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { awards, capabilityStrip } from "@/content/site";
import { getDict, getLang } from "@/i18n/server";

export async function Hero() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const showAwards = awards.verified && awards.items.length > 0;
  return (
    <section className="bg-hero relative overflow-hidden pt-32 md:pt-40">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <Container className="relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h1 className={`font-bold tracking-tight ${lang === "bn" ? "text-4xl leading-[1.25] sm:text-5xl md:text-6xl" : "text-4xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl"}`}>
            <span className="gradient-text">{lang === "bn" ? "আস্তারিও:" : "Astareo:"}</span>
            <br />
            {d.hero.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {d.hero.strap} <span className="px-1 text-border">|</span> {d.hero.sub}
          </p>
          <div className="mt-9 flex flex-col items-center gap-3">
            <ButtonLink href="/get-started" variant="outline" size="lg">
              {d.hero.cta}
            </ButtonLink>
            <p className="text-xs text-muted-foreground">
              {d.hero.note1} <span className="px-1">|</span> {d.hero.note2}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-primary/30 to-brand-purple/30 opacity-60 blur-3xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-2xl border border-border/60 shadow-2xl">
            <Image src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&h=900&fit=crop&auto=format&q=75" alt={d.hero.imageAlt} width={1600} height={900} priority sizes="(min-width: 1024px) 1024px, 100vw" className="h-auto w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
        </Reveal>

        <div className="relative mx-auto mt-12 max-w-4xl pb-14">
          {showAwards ? (
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5" aria-label="Awards and recognition">
              {awards.items.map((a) => (
                <li key={`${a.issuer}-${a.year}`} className="text-center">
                  <p className="text-xs text-muted-foreground">{a.year}</p>
                  <p className="font-semibold">{a.issuer}</p>
                  <p className="text-xs text-primary">{a.title}</p>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-wrap items-center justify-center gap-3">
              {capabilityStrip.map((c, i) => (
                <li key={c.label} className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-foreground/80">
                  <Icon name={c.icon} className="h-4 w-4 text-primary" />
                  {d.hero.capabilities[i] ?? c.label}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {d.hero.trust}
          </p>
        </div>
      </Container>
    </section>
  );
}
