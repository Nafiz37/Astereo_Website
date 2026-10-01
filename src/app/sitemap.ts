import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { docs } from "@/content/docs";
import { industries } from "@/content/industries";
import { posts } from "@/content/posts";
import { site } from "@/content/site";
import { solutions } from "@/content/solutions";
import { whitepapers } from "@/content/whitepapers";
import { localizeHref } from "@/i18n/config";

/** Every page is listed once per language, with hreflang alternates pointing at the other version. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = ["", "/solutions", "/industries", "/case-studies", "/blog", "/pricing", "/about", "/careers", "/contact", "/partners", "/press", "/get-started", "/resources/documentation", "/resources/whitepapers", "/resources/api-reference", "/resources/changelog", "/privacy", "/terms"];
  const entries: { path: string; priority: number; lastModified: Date }[] = [
    ...fixed.map((p) => ({ path: p || "/", priority: p === "" ? 1 : 0.7, lastModified: now })),
    ...solutions.map((s) => ({ path: `/solutions/${s.slug}`, priority: 0.9, lastModified: now })),
    ...industries.map((i) => ({ path: `/industries/${i.slug}`, priority: 0.8, lastModified: now })),
    ...caseStudies.map((c) => ({ path: `/case-studies/${c.slug}`, priority: 0.6, lastModified: now })),
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.6, lastModified: new Date(p.date) })),
    ...docs.map((d) => ({ path: `/resources/documentation/${d.slug}`, priority: 0.5, lastModified: now })),
    ...whitepapers.map((w) => ({ path: `/resources/whitepapers/${w.slug}`, priority: 0.5, lastModified: new Date(w.date) })),
  ];
  return entries.flatMap((e) =>
    (["en", "bn"] as const).map((lang) => ({
      url: `${site.url}${localizeHref(e.path, lang) === "/" ? "" : localizeHref(e.path, lang)}`,
      lastModified: e.lastModified,
      changeFrequency: "monthly" as const,
      priority: e.priority,
      alternates: { languages: { en: `${site.url}${e.path === "/" ? "" : e.path}`, bn: `${site.url}${localizeHref(e.path, "bn")}` } },
    })),
  );
}
