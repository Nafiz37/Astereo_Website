import Link from "@/components/ui/link";
import { ArrowRight, Bot, Headphones, Layers } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { techStack } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";

const icons = [Layers, Bot, Headphones];
const hrefs = ["/get-started", "/solutions/ai-agents", "/contact"];

export async function WhyChoose() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  return (
    <section className="section" aria-labelledby="why-title">
      <Container>
        <SectionHeader
          eyebrow={d.why.eyebrow}
          title={
            <span id="why-title">
              {d.why.titleA}
              <br />
              <span className="gradient-text">{d.why.titleB}</span>
            </span>
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {d.why.features.map((f, i) => {
            const Ico = icons[i];
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <Link href={hrefs[i]} className="surface surface-hover group flex h-full flex-col p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-brand-purple/25 text-primary">
                    <Ico className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{f.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {f.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16">
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{d.why.techTitle}</h3>
          <ul className="mx-auto grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {techStack.map((t) => (
              <li key={t.name} className="surface flex flex-col items-center gap-2 px-2 py-4 text-center" title={t.name}>
                <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">{t.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-20">
          <h3 className="mb-8 text-center text-2xl font-semibold">{d.why.processTitle}</h3>
          <ol className="grid gap-4 md:grid-cols-5">
            {d.process.map((p, i) => (
              <li key={p.title} className="surface relative p-5">
                <span className="gradient-text text-3xl font-bold">{lang === "bn" ? toBanglaDigits(`0${i + 1}`) : `0${i + 1}`}</span>
                <h4 className="mt-2 font-semibold">{p.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-10 text-center">
          <ButtonLink href="/about" variant="outline">
            {d.why.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
