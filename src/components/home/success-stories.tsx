import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { caseStudiesFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { Carousel } from "./case-studies-carousel";
import { CaseStudyCard } from "./case-study-card";

export async function SuccessStories() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const caseStudies = caseStudiesFor(lang);
  const allVerified = caseStudies.every((c) => c.verified);
  return (
    <section className="section bg-card/30" aria-labelledby="stories-title">
      <Container>
        <SectionHeader eyebrow={d.stories.eyebrow} title={<span id="stories-title">{d.stories.title}</span>} description={allVerified ? undefined : d.stories.desc} />
        <Carousel label={d.stories.title}>{caseStudies.map((c) => <CaseStudyCard key={c.slug} cs={c} />)}</Carousel>
        <div className="mt-8 text-center">
          <ButtonLink href="/case-studies" variant="outline">
            {d.stories.viewAll}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
