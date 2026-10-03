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