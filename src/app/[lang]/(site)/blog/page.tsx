import { ArrowRight, Clock } from "lucide-react";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { posts } from "@/content/posts";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.blog.metaTitle, description: d.pages.blog.metaDesc, path: "/blog" }));

export default async function BlogPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.blog;
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHero eyebrow={d.nav.items["/blog"].label} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/blog"].label }]} />
          <EnglishOnlyNotice />
          <ul className="grid gap-6 md:grid-cols-2">
            {sorted.map((post) => (
              <li key={post.slug}>
                <article className="surface surface-hover group relative h-full p-7">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t}</span>)}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold leading-snug" lang="en">
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground" lang="en">{post.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(post.date, lang)} · {post.author}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lang === "bn" ? toBanglaDigits(post.readMinutes) : post.readMinutes} {d.common.min}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">{d.common.readArticle} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </article>
              </li>
            ))}
          </ul>
          <div className="surface mx-auto mt-14 max-w-xl p-8 text-center">
            <h2 className="text-xl font-semibold">{p.newsletterTitle}</h2>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">{p.newsletterDesc}</p>
            <NewsletterForm source="blog" />
          </div>
        </Container>
      </section>
    </>
  );
}
