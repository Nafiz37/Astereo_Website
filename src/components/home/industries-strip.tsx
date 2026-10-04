import Image from "next/image";
import Link from "@/components/ui/link";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { industriesFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";

export async function IndustriesStrip() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const industries = industriesFor(lang);
  const loop = [...industries, ...industries];
  return (
    <section className="section overflow-hidden bg-card/30" aria-labelledby="industries-title">
      <Container>
        <SectionHeader eyebrow={d.industriesSection.eyebrow} title={<span id="industries-title">{d.industriesSection.title}</span>} />
      </Container>
      <div className="marquee-mask pause-on-hover overflow-hidden" dir="ltr">
        <ul className="animate-marquee flex w-max gap-5 px-2.5" style={{ animationDuration: "70s" }}>
          {loop.map((i, idx) => (
            <li key={`${i.slug}-${idx}`} className="w-[300px] shrink-0" aria-hidden={idx >= industries.length || undefined}>
              <Link href={`/industries/${i.slug}`} tabIndex={idx >= industries.length ? -1 : 0} className="surface surface-hover group block overflow-hidden">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image src={i.image} alt={i.name} fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background/70 text-xl backdrop-blur" aria-hidden="true">
                    {i.emoji}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{i.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{i.headline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/industries" variant="outline">
          {d.industriesSection.button}
        </ButtonLink>
      </div>
    </section>
  );
}
