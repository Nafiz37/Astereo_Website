import type { Metadata } from "next";
import { site } from "@/content/site";
import { localeMeta, localizeHref, type Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { dictionaries } from "@/i18n/dictionaries";
import { getLang } from "@/i18n/server";

type MetaInput = { title: string; description: string; path: string; type?: "website" | "article" };

/** Builds page metadata with canonical + hreflang alternates for English and Bangla. */
export function buildMetadata({ title, description, path, type = "website" }: MetaInput, lang: Locale): Metadata {
  const url = localizeHref(path, lang);
  const siteName = lang === "bn" ? "আস্তারিও" : site.name;
  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: path, bn: localizeHref(path, "bn"), "x-default": path } },
    openGraph: { title: `${title} | ${siteName}`, description, url, siteName, type, locale: localeMeta[lang].ogLocale, alternateLocale: lang === "bn" ? "en_US" : "bn_BD" },
    twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description },
  };
}

/**
 * Creates a `generateMetadata` for a page from a builder that receives the active dictionary:
 *   export const generateMetadata = pageMeta((d) => ({ title: d.pages.pricing.metaTitle, ... , path: "/pricing" }));
 */
export const pageMeta =
  (build: (d: Dict, lang: Locale) => MetaInput) =>
  async (): Promise<Metadata> => {
    const lang = await getLang();
    return buildMetadata(build(dictionaries[lang], lang), lang);
  };
