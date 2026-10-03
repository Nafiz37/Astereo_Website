import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Prose } from "@/components/ui/prose";
import { Container } from "@/components/ui/section";
import { docs, getDoc } from "@/content/docs";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => docs.map((x) => ({ slug: x.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [lang, { slug }] = await Promise.all([getLang(), params]);
  const x = getDoc(slug);
  return x ? buildMetadata({ title: x.title, description: x.summary, path: `/resources/documentation/${x.slug}` }, lang) : {};
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, { slug }] = await Promise.all([getDict(), params]);
  const doc = getDoc(slug);
  if (!doc) notFound();
  return (
    <>
      <div className="bg-hero pb-6 pt-32 md:pt-36">
        <Container>
          <Breadcrumbs items={[{ label: d.pages.docs.title, href: "/resources/documentation" }, { label: doc.title }]} />
          <EnglishOnlyNotice />
          <div lang="en">
            <p className="eyebrow mb-2">{doc.category}</p>
            <h1 className="text-3xl font-bold md:text-5xl">{doc.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{doc.summary}</p>
          </div>
        </Container>
      </div>
      <section className="py-10">
        <Container className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label={d.pages.docs.title} className="lg:sticky lg:top-24 lg:self-start" lang="en">
            <ul className="space-y-1">
              {docs.map((x) => (
                <li key={x.slug}>
                  <Link href={`/resources/documentation/${x.slug}`} aria-current={x.slug === slug ? "page" : undefined} className={cn("block rounded-lg px-3 py-2 text-sm", x.slug === slug ? "bg-primary/15 font-medium text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                    {x.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="max-w-3xl" lang="en"><Prose>{doc.body}</Prose></article>
        </Container>
      </section>
      <PageCta />
    </>
  );
}
