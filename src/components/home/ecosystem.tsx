import { Container } from "@/components/ui/section";
import { ecosystem } from "@/content/site";
import { getDict } from "@/i18n/server";

export async function Ecosystem() {
  const d = await getDict();
  const title = ecosystem.clientsVerified ? d.ecosystem.titleVerified : d.ecosystem.titleHonest;
  const loop = [...ecosystem.items, ...ecosystem.items];
  return (
    <section className="border-y border-border/50 bg-card/30 py-12" aria-labelledby="ecosystem-title">
      <Container>
        <h2 id="ecosystem-title" className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {title}
        </h2>
        <div className="marquee-mask pause-on-hover overflow-hidden" dir="ltr">
          <ul className="animate-marquee flex w-max items-center gap-14 pr-14" aria-label={title}>
            {loop.map((name, i) => (
              <li key={`${name}-${i}`} aria-hidden={i >= ecosystem.items.length} className="whitespace-nowrap text-xl font-semibold tracking-tight text-foreground/40 transition-colors hover:text-foreground/80">
                {name}
              </li>
            ))}
          </ul>
        </div>
        {!ecosystem.clientsVerified && <p className="mt-6 text-center text-[11px] text-muted-foreground/70">{d.ecosystem.disclaimer}</p>}
      </Container>
    </section>
  );
}
