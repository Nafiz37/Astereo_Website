import { BookOpen } from "lucide-react";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { docs } from "@/content/docs";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.docs.metaTitle, description: d.pages.docs.metaDesc, path: "/resources/documentation" }));

export default async function DocsIndex() {
  const d = await getDict();
  const p = d.pages.docs;
  const categories = [...new Set(docs.map((x) => x.category))];
  return (
    <>
      <PageHero eyebrow={d.nav.resources} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.resources }, { label: p.title }]} />
          <EnglishOnlyNotice />
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground" lang="en">{cat}</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {docs.filter((x) => x.category === cat).map((x) => (
                  <li key={x.slug}>
                    <Link href={`/resources/documentation/${x.slug}`} className="surface surface-hover flex h-full gap-4 p-5">
                      <BookOpen className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span lang="en"><span className="block font-semibold">{x.title}</span><span className="block text-sm text-muted-foreground">{x.summary}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            {p.apiNote}{" "}
            <Link href="/resources/api-reference" className="text-primary underline">{p.apiLink}</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
