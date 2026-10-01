import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import Link from "@/components/ui/link";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Prose } from "@/components/ui/prose";
import { Container } from "@/components/ui/section";
import { getPost, posts } from "@/content/posts";
import { site } from "@/content/site";
import { getDict, getLang } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => posts.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [lang, { slug }] = await Promise.all([getLang(), params]);
  const p = getPost(slug);
  return p ? buildMetadata({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}`, type: "article" }, lang) : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [d, { slug }] = await Promise.all([getDict(), params]);
  const p = getPost(slug);
  if (!p) notFound();
  const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    inLanguage: "en",
    datePublished: p.date,
    dateModified: p.date,
    author: { "@type": "Organization", name: p.author },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
    mainEntityOfPage: `${site.url}/blog/${p.slug}`,
  };
  return (
    <>
      <article className="bg-hero pb-6 pt-32 md:pt-36">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: d.nav.items["/blog"].label, href: "/blog" }, { label: p.title }]} />
          <EnglishOnlyNotice />
          <div lang="en">
            <div className="flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t}</span>)}</div>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">{p.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>
            <p className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{p.author}</span>·<time dateTime={p.date}>{formatDate(p.date)}</time>·<span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readMinutes} min read</span>
            </p>
          </div>
        </Container>
      </article>
      <section className="pb-16">
        <Container className="max-w-3xl">
          <div lang="en"><Prose>{p.body}</Prose></div>
          <hr className="my-12 border-border" />
          <h2 className="mb-4 text-lg font-semibold">{d.pages.blog.keepReading}</h2>
          <ul className="space-y-2" lang="en">
            {others.map((o) => <li key={o.slug}><Link href={`/blog/${o.slug}`} className="text-primary hover:underline">{o.title}</Link></li>)}
          </ul>
        </Container>
      </section>
      <PageCta />
      <JsonLd data={ld} />
    </>
  );
}
