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