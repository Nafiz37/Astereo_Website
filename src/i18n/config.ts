export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (locales as readonly string[]).includes(v);

/** Paths that are never locale-prefixed. */
const UNLOCALIZED = /^\/(api|admin|_next|icon\.svg|robots\.txt|sitemap\.xml|opengraph-image)(\/|$|\?|#)/;

/**
 * Adds the locale prefix for non-default locales. English URLs stay unprefixed (/pricing),
 * Bangla URLs are /bn/pricing. External, hash-only and asset links are returned untouched.
 */
export function localizeHref(href: string, lang: Locale): string {
  if (lang === defaultLocale) return href;
  if (!href.startsWith("/") || href.startsWith("//") || UNLOCALIZED.test(href)) return href;
  if (href === "/bn" || href.startsWith("/bn/") || href.startsWith("/bn?") || href.startsWith("/bn#")) return href;
  return href === "/" ? "/bn" : `/bn${href}`;
}

/** Removes a leading locale prefix: "/bn/pricing" -> "/pricing". */
export function stripLocale(pathname: string): string {
  if (pathname === "/bn") return "/";
  return pathname.startsWith("/bn/") ? pathname.slice(3) : pathname;
}

export const localeMeta: Record<Locale, { label: string; native: string; htmlLang: string; ogLocale: string }> = {
  en: { label: "English", native: "English", htmlLang: "en", ogLocale: "en_US" },
  bn: { label: "Bangla", native: "বাংলা", htmlLang: "bn", ogLocale: "bn_BD" },
};

/** Digits: Bangla readers expect ০-৯. Applied only to numbers we format ourselves (never to user data). */
export const toBanglaDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
