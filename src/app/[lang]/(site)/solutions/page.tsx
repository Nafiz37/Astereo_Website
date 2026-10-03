import { SolutionsGrid } from "@/components/home/solutions-grid";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero } from "@/components/ui/section";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.solutions.metaTitle, description: d.pages.solutions.metaDesc, path: "/solutions" }));

export default async function SolutionsPage() {
  const d = await getDict();
  const p = d.pages.solutions;
  return (
    <>
      <PageHero eyebrow={d.solutionsSection.eyebrow} title={p.title} description={p.desc} />
      <Container className="-mt-6 pt-6">
        <Breadcrumbs items={[{ label: d.nav.solutions }]} />
      </Container>
      <SolutionsGrid withHeader={false} />
      <section className="section pt-0">
        <Container>
          <h2 className="mb-8 text-center text-2xl font-semibold">{p.howWeDeliver}</h2>
          <ol className="grid gap-4 md:grid-cols-5">
            {d.process.map((s) => (
              <li key={s.title} className="surface p-5">
                <Icon name="target" className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
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
