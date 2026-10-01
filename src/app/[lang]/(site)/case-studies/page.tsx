import { CaseStudyCard } from "@/components/home/case-study-card";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero } from "@/components/ui/section";
import { caseStudies } from "@/content/case-studies";
import { caseStudiesFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.caseStudies.metaTitle, description: d.pages.caseStudies.metaDesc, path: "/case-studies" }));

export default async function CaseStudiesPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.caseStudies;
  const anyUnverified = caseStudies.some((c) => !c.verified);
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={anyUnverified ? p.desc : undefined} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/case-studies"].label }]} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseStudiesFor(lang).map((c) => <CaseStudyCard key={c.slug} cs={c} />)}
          </div>
        </Container>
      </section>
      <PageCta title={d.pageCta.caseTitle} body={d.pageCta.caseBody} />
    </>
  );
}
