import { caseStudies, type CaseStudy } from "@/content/case-studies";
import { industries, type Industry } from "@/content/industries";
import { solutions, type Solution } from "@/content/solutions";
import { casesBn } from "./cases.bn";
import type { Locale } from "./config";
import { industriesBn } from "./industries.bn";
import { solutionsBn } from "./solutions.bn";

/** Pure helpers that merge the Bangla overlays over the English catalogue. English is always the fallback. */

export function localizeSolution(s: Solution, lang: Locale): Solution {
  if (lang !== "bn") return s;
  return { ...s, ...solutionsBn[s.slug] };
}
export const solutionsFor = (lang: Locale) => solutions.map((s) => localizeSolution(s, lang));
export const getSolutionFor = (slug: string, lang: Locale) => {
  const s = solutions.find((x) => x.slug === slug);
  return s ? localizeSolution(s, lang) : undefined;
};

export function localizeIndustry(i: Industry, lang: Locale): Industry {
  if (lang !== "bn") return i;
  const o = industriesBn[i.slug];
  if (!o) return i;
  const { how, ...rest } = o;
  return { ...i, ...rest, offerings: i.offerings.map((off, n) => ({ ...off, how: how?.[n] ?? off.how })) };
}
export const industriesFor = (lang: Locale) => industries.map((i) => localizeIndustry(i, lang));
export const getIndustryFor = (slug: string, lang: Locale) => {
  const i = industries.find((x) => x.slug === slug);
  return i ? localizeIndustry(i, lang) : undefined;
};

export function localizeCase(c: CaseStudy, lang: Locale): CaseStudy {
  if (lang !== "bn") return c;
  const o = casesBn[c.slug];
  if (!o) return c;
  const { metricLabels, ...rest } = o;
  return { ...c, ...rest, metrics: c.metrics.map((m, n) => ({ ...m, label: metricLabels?.[n] ?? m.label })) };
}
export const caseStudiesFor = (lang: Locale) => caseStudies.map((c) => localizeCase(c, lang));
export const getCaseStudyFor = (slug: string, lang: Locale) => {
  const c = caseStudies.find((x) => x.slug === slug);
  return c ? localizeCase(c, lang) : undefined;
};

