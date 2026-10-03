import type { Metadata } from "next";
import { Compliance } from "@/components/home/compliance";
import { CtaSection } from "@/components/home/cta-section";
import { Ecosystem } from "@/components/home/ecosystem";
import { GlobalReach } from "@/components/home/global-reach";
import { Hero } from "@/components/home/hero";
import { IndustriesStrip } from "@/components/home/industries-strip";
import { SolutionsGrid } from "@/components/home/solutions-grid";
import { SuccessStories } from "@/components/home/success-stories";
import { WhyChoose } from "@/components/home/why-choose";
import { Faq } from "@/components/ui/misc";
import { Container, SectionHeader } from "@/components/ui/section";
import { buildMetadata } from "@/lib/seo";
import { getDict, getLang } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const m = buildMetadata({ title: d.meta.homeTitle, description: d.meta.siteDescription, path: "/" }, lang);
  return { ...m, title: { absolute: d.meta.homeTitle } };
}

export default async function HomePage() {
  const d = await getDict();
  return (
    <>
      <Hero />
      <Ecosystem />
      <SolutionsGrid />
      <GlobalReach />
      <IndustriesStrip />
      <WhyChoose />
      <SuccessStories />
      <Compliance />
      <section className="section pt-0" aria-labelledby="faq-title">
        <Container>
          <SectionHeader eyebrow={d.faq.eyebrow} title={<span id="faq-title">{d.faq.title}</span>} />
          <Faq items={d.pages.pricing.faqs} />
        </Container>
      </section>
      <CtaSection />
    </>
  );
}
