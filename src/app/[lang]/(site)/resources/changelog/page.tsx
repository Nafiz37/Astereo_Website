import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { changelog } from "@/content/company";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.changelog.metaTitle, description: "What's new on the Astareo website and platform.", path: "/resources/changelog" }));

export default async function ChangelogPage() {
  const d = await getDict();
  return (
    <>
      <PageHero eyebrow={d.nav.resources} title={d.pages.changelog.title} description={d.pages.changelog.desc} />
      <section className="section pt-12">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: d.nav.resources }, { label: d.pages.changelog.title }]} />
          <EnglishOnlyNotice />
          <ol className="space-y-8 border-l border-border pl-8">
            {changelog.map((c) => (
              <li key={c.version} className="relative">
                <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <p className="text-sm text-muted-foreground"><time dateTime={c.date}>{formatDate(c.date)}</time> · v{c.version}</p>
                <h2 className="mt-1 text-xl font-semibold">{c.title}</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/85 marker:text-primary">{c.changes.map((x) => <li key={x}>{x}</li>)}</ul>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
