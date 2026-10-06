import { lang as rootLang } from "next/root-params";
import { defaultLocale, isLocale, localizeHref, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import type { Dict } from "./en";

export { dictionaries };

/** Current locale in any Server Component (read from the /[lang] root segment, no prop drilling). */
export async function getLang(): Promise<Locale> {
  const l = await rootLang();
  return isLocale(l) ? l : defaultLocale;
}

export async function getDict(): Promise<Dict> {
  return dictionaries[await getLang()];
}

/** Locale-aware path for places that build URLs as strings (metadata, JSON-LD). */
export const hrefFor = (path: string, lang: Locale) => localizeHref(path, lang);
