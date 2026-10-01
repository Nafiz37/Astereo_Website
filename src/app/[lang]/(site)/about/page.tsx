import { Compass, Eye, Globe2 } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { Breadcrumbs } from "@/components/ui/misc";
import { PageCta } from "@/components/ui/page-cta";
import { Container, PageHero, SectionHeader } from "@/components/ui/section";
import { markets, site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.about.metaTitle, description: d.pages.about.metaDesc, path: "/about" }));

export default async function AboutPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.about;
  const icons = [Compass, Eye, Globe2];
  const year = lang === "bn" ? toBanglaDigits(site.foundedYear) : String(site.foundedYear);
  const marketNames = d.reach.marketNames;
  const desc = lang === "bn" ? `${year} ${p.descSuffix}` : `${d.hero.strap}. ${p.descPrefix} ${year}, ${p.descSuffix}`;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={desc} />