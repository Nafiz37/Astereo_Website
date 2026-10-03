import { ArrowRight, FileText } from "lucide-react";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { whitepapers } from "@/content/whitepapers";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.whitepapers.metaTitle, description: d.pages.whitepapers.metaDesc, path: "/resources/whitepapers" }));

export default async function WhitepapersPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.whitepapers;
  return (
    <>
      <PageHero eyebrow={d.nav.resources} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.resources }, { label: p.title }]} />
          <EnglishOnlyNotice />
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {whitepapers.map((w) => (
              <li key={w.slug}>
                <Link href={`/resources/whitepapers/${w.slug}`} className="surface surface-hover group flex h-full flex-col p-7">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="mt-4 text-lg font-semibold" lang="en">{w.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground" lang="en">{w.summary}</p>
                  <p className="mt-4 text-xs text-muted-foreground">{formatDate(w.date, lang)} · {lang === "bn" ? toBanglaDigits(w.readMinutes) : w.readMinutes} {d.common.minRead}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">{d.common.readPaper} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
