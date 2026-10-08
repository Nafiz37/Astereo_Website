import { docs } from "@/content/docs";
import { posts } from "@/content/posts";
import { whitepapers } from "@/content/whitepapers";
import type { Locale } from "@/i18n/config";
import { caseStudiesFor, industriesFor, solutionsFor } from "@/i18n/localize";
import { dictionaries } from "@/i18n/dictionaries";

export type SearchItem = { title: string; desc: string; href: string; type: string; keywords: string };

const pageTypes: Record<string, string> = {
  "/pricing": "Page",
  "/get-started": "Page",
  "/contact": "Page",
  "/about": "Company",
  "/careers": "Company",
  "/partners": "Company",
  "/press": "Company",
  "/resources/api-reference": "Resource",
  "/resources/changelog": "Resource",
  "/privacy": "Legal",
  "/terms": "Legal",
};
const pageKeywords: Record<string, string> = {
  "/pricing": "price cost quote budget মূল্য খরচ বাজেট",
  "/get-started": "schedule meeting call demo get started consultation পরামর্শ মিটিং",
  "/contact": "email phone support enquiry যোগাযোগ ইমেইল ফোন",
  "/about": "company story team কোম্পানি",
  "/careers": "jobs hiring apply চাকরি ক্যারিয়ার",
  "/partners": "partner referral পার্টনার",
  "/press": "media logo boilerplate মিডিয়া",
  "/resources/api-reference": "api endpoint rest",
  "/resources/changelog": "release updates",
  "/privacy": "gdpr data cookies গোপনীয়তা",
  "/terms": "legal terms conditions শর্তাবলি",
};

/** Search entries in the requested language. Blog, docs and whitepapers are English-only for now. */
export function buildSearchIndex(lang: Locale = "en"): SearchItem[] {
  const d = dictionaries[lang];
  return [
    ...solutionsFor(lang).map((s) => ({ title: s.name, desc: s.summary, href: `/solutions/${s.slug}`, type: "Solution", keywords: `${s.tagline} ${s.tech.join(" ")} ${s.useCases.join(" ")}` })),
    ...industriesFor(lang).map((i) => ({ title: i.name, desc: i.headline, href: `/industries/${i.slug}`, type: "Industry", keywords: i.challenges.join(" ") })),
    ...caseStudiesFor(lang).map((c) => ({ title: c.title, desc: c.challenge, href: `/case-studies/${c.slug}`, type: "Case study", keywords: `${c.industry} ${c.tech.join(" ")}` })),
    ...posts.map((p) => ({ title: p.title, desc: p.excerpt, href: `/blog/${p.slug}`, type: "Blog", keywords: p.tags.join(" ") })),
    ...docs.map((x) => ({ title: x.title, desc: x.summary, href: `/resources/documentation/${x.slug}`, type: "Docs", keywords: x.category })),
    ...whitepapers.map((w) => ({ title: w.title, desc: w.summary, href: `/resources/whitepapers/${w.slug}`, type: "Whitepaper", keywords: w.keyTakeaways.join(" ") })),
    ...Object.entries(d.search.pages).map(([href, p]) => ({ title: p.title, desc: p.desc, href, type: pageTypes[href] ?? "Page", keywords: pageKeywords[href] ?? "" })),
  ];
}
