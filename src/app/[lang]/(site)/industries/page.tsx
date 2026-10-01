import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "@/components/ui/link";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero } from "@/components/ui/section";
import { industriesFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.industries.metaTitle, description: d.pages.industries.metaDesc, path: "/industries" }));

export default async function IndustriesPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.industries;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.industries }]} />
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {industriesFor(lang).map((i) => (
              <li key={i.slug}>
                <Link href={`/industries/${i.slug}`} className="surface surface-hover group block h-full overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={i.image} alt={i.name} fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />