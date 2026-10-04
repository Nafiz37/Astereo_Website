import { BookOpen, Phone, Rocket } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { getDict } from "@/i18n/server";

export async function CtaSection() {
  const d = await getDict();
  return (
    <section className="section pt-0" aria-labelledby="cta-title">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-brand-purple/20 p-8 md:p-14">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl text-center">
            <Rocket className="mx-auto h-10 w-10 text-primary" />
            <h2 id="cta-title" className="mt-4 text-3xl font-bold md:text-4xl">
              {d.cta.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{d.cta.body}</p>
            <ButtonLink href="/get-started" size="lg" className="mt-8">
              {d.cta.button}
            </ButtonLink>
          </div>
          <div className="relative mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/50 p-6 backdrop-blur">
              <BookOpen className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{d.cta.resourcesTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.cta.resourcesBody}</p>
              <ButtonLink href="/resources/documentation" variant="ghost" size="sm" className="mt-4">
                {d.cta.resourcesButton}
              </ButtonLink>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 p-6 backdrop-blur">
              <Phone className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{d.cta.salesTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.cta.salesBody}</p>
              <ButtonLink href="/contact" variant="ghost" size="sm" className="mt-4">
                {d.cta.salesButton}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
