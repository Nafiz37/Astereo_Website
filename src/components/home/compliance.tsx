import { BadgeCheck, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { compliance } from "@/content/site";
import { getDict } from "@/i18n/server";

export async function Compliance() {
  const d = await getDict();
  const anyCertified = compliance.some((c) => c.certified);
  return (
    <section className="section" aria-labelledby="compliance-title">
      <Container>
        <SectionHeader eyebrow={d.compliance.eyebrow} title={<span id="compliance-title">{d.compliance.title}</span>} description={d.compliance.desc} />
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {compliance.map((c, i) => (
            <li key={c.name} className="list-none">
              <Reveal delay={(i % 4) * 0.05} className="surface flex h-full flex-col items-center p-5 text-center">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${c.certified ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                  {c.certified ? <BadgeCheck className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </span>
                <h3 className="mt-3 font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{d.compliance.areas[i] ?? c.area}</p>
                <span className={`mt-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.certified ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{c.certified ? d.compliance.certified : d.compliance.aligned}</span>
              </Reveal>
            </li>
          ))}
        </ul>
        {!anyCertified && <p className="mt-6 text-center text-xs text-muted-foreground">{d.compliance.note}</p>}
        <div className="mt-8 text-center">
          <ButtonLink href="/resources/documentation/security-practices" variant="ghost">
            {d.compliance.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
