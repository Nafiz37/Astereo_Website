import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { industriesFor, solutionsFor } from "@/i18n/localize";

export type NavItem = { label: string; desc?: string; href: string; icon?: string };
export type NavGroup = { label: string; href?: string; items?: NavItem[]; footer?: NavItem };

const item = (d: Dict, href: string): NavItem => ({ label: d.nav.items[href].label, desc: d.nav.items[href].desc, href });

/** Navigation tree in the active language (labels come from the dictionary and the localised catalogue). */
export function buildNav(d: Dict, lang: Locale): NavGroup[] {
  return [
    {
      label: d.nav.solutions,
      items: solutionsFor(lang).map((s) => ({ label: s.navName, desc: s.navDesc, href: `/solutions/${s.slug}`, icon: s.icon })),
      footer: { ...d.nav.featuredSolution, href: "/solutions/custom-software" },
    },
    {
      label: d.nav.industries,
      items: industriesFor(lang).filter((i) => i.navName && i.navDesc).map((i) => ({ label: i.navName!, desc: i.navDesc, href: `/industries/${i.slug}` })),