import { Check } from "lucide-react";
import { BookingWidget } from "@/components/forms/booking-widget";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.getStarted.metaTitle, description: d.pages.getStarted.metaDesc, path: "/get-started" }));

export default async function GetStartedPage() {
  const d = await getDict();
  const p = d.pages.getStarted;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={d.cta.title} description={d.cta.body}>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {p.points.map((t) => <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" />{t}</li>)}
        </ul>
      </PageHero>
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.common.getStarted }]} />
          <BookingWidget />
        </Container>
      </section>
    </>
  );
}
