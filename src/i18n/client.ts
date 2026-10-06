"use client";

import { useParams } from "next/navigation";
import { bn } from "./bn";
import { defaultLocale, isLocale, type Locale } from "./config";
import { en, type Dict } from "./en";

const dictionaries: Record<Locale, Dict> = { en, bn };

/** Current locale inside Client Components. */
export function useLang(): Locale {
  const { lang } = useParams<{ lang?: string }>();
  return isLocale(lang) ? lang : defaultLocale;
}

export function useDict(): Dict {
  return dictionaries[useLang()];
}
