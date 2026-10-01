import { Compass, Eye, Globe2 } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero, SectionHeader } from "@/components/ui/section";
import { markets, site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.about.metaTitle, description: d.pages.about.metaDesc, path: "/about" }));

export default async function AboutPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.about;
  const icons = [Compass, Eye, Globe2];
  const year = lang === "bn" ? toBanglaDigits(site.foundedYear) : String(site.foundedYear);
  const marketNames = d.reach.marketNames;
  const desc = lang === "bn" ? `${year} ${p.descSuffix}` : `${d.hero.strap}. ${p.descPrefix} ${year}, ${p.descSuffix}`;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/about"].label }]} />
          <div className="grid gap-6 md:grid-cols-3">
            {p.cards.map((c, i) => {
              const Ico = icons[i];
              return (
                <div key={c.title} className="surface p-7">
                  <Ico className="h-7 w-7 text-primary" />
                  <h2 className="mt-4 text-xl font-semibold">{c.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i === 2 ? `${c.body} ${marketNames.join(lang === "bn" ? ", " : ", ")}${lang === "bn" ? "।" : "."}` : c.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="section bg-card/30">
        <Container>
          <SectionHeader eyebrow={p.valuesEyebrow} title={p.valuesTitle} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {d.values.map((v) => (
              <div key={v.title} className="surface p-6">
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <SectionHeader eyebrow={p.presenceEyebrow} title={p.presenceTitle} />
          <ul className="flex flex-wrap justify-center gap-3">
            {markets.map((m, i) => (
              <li key={m.name} className="surface flex items-center gap-2 px-5 py-3"><Flag code={m.code} name={m.name} /><span className="font-medium">{marketNames[i] ?? m.name}</span></li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section pt-0">
        <Container>
          <SectionHeader eyebrow={p.processEyebrow} title={p.processTitle} />
          <ol className="grid gap-4 md:grid-cols-5">
            {d.process.map((s, i) => (
              <li key={s.title} className="surface p-5">
                <span className="gradient-text text-3xl font-bold">{lang === "bn" ? toBanglaDigits(`0${i + 1}`) : `0${i + 1}`}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <PageCta />
    </>
  );
}
