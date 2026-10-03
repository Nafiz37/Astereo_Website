import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Prose } from "@/components/ui/prose";
import { Container } from "@/components/ui/section";
import { getWhitepaper, whitepapers } from "@/content/whitepapers";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => whitepapers.map((w) => ({ slug: w.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [lang, { slug }] = await Promise.all([getLang(), params]);
  const w = getWhitepaper(slug);
  return w ? buildMetadata({ title: w.title, description: w.summary, path: `/resources/whitepapers/${w.slug}`, type: "article" }, lang) : {};
}

export default async function WhitepaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, { slug }] = await Promise.all([getDict(), params]);
  const w = getWhitepaper(slug);
  if (!w) notFound();
  const p = d.pages.whitepapers;
  return (
    <>
      <div className="bg-hero pb-6 pt-32 md:pt-36">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: p.title, href: "/resources/whitepapers" }, { label: w.title }]} />
          <EnglishOnlyNotice />
          <div lang="en">
            <p className="eyebrow mb-2">Whitepaper</p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">{w.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{w.summary}</p>
            <p className="mt-4 text-sm text-muted-foreground">{formatDate(w.date)} · {w.readMinutes} min read</p>
          </div>
        </Container>
      </div>
      <section className="py-10">
        <Container className="max-w-3xl">
          <div className="surface mb-8 border-primary/30 p-6" lang="en">
            <h2 className="flex items-center gap-2 font-semibold"><Lightbulb className="h-5 w-5 text-primary" /> Key takeaways</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/85 marker:text-primary">{w.keyTakeaways.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
          <div lang="en"><Prose>{w.body}</Prose></div>
          <div className="surface mt-12 p-6">
            <h2 className="font-semibold">{p.moreTitle}</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">{p.moreDesc}</p>
            <NewsletterForm source={`whitepaper:${w.slug}`} />
          </div>
        </Container>
      </section>
      <PageCta />
    </>
  );
}
