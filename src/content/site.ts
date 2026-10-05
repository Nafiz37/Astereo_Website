/**
 * Central, business-owned facts about Astareo.
 *
 * EVERYTHING that is a factual claim about the company (awards, clients, certifications,
 * statistics, case-study results) lives here or in `case-studies.ts` behind a `verified`
 * flag. While a flag is `false` the site renders neutral wording instead of the claim.
 * Flip a flag to `true` ONLY when you can prove the claim (certificate, signed case study,
 * published award page, analytics export). This keeps the website honest and legally safe.
 */

export const site = {
  name: "Astareo",
  legalName: "Astareo Inc.",
  domain: "astareo.tech",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://astareo.tech",
  tagline: "Transform Your Business with Enterprise Software",
  strapline: "Where Innovation Meets Reliability",
  description:
    "Astareo builds custom enterprise software, AI agents, LMS and ERP platforms, news & ticketing systems, and CI/CD pipelines for growing businesses worldwide.",
  email: "contact@astareo.com",
  phone: "+8801850064578",
  phoneDisplay: "+880 1850-064578",
  foundedYear: 2020,
  hqCountry: "Bangladesh",
  social: {
    linkedin: "https://www.linkedin.com/company/astareo",
    facebook: "https://www.facebook.com/people/Astareo/61578896906415/",
    twitter: "https://twitter.com/astareo",
  },
} as const;

/** Consultation scheduling rules (all times in `timezone`). */
export const business = {
  timezone: "Asia/Dhaka",
  /** 0 = Sunday ... 6 = Saturday. Bangladesh working week is Sunday-Thursday. */
  workingDays: [0, 1, 2, 3, 4],
  startHour: 10,
  endHour: 18,
  slotMinutes: 30,
  minNoticeHours: 12,
  /** Visitors can reschedule or cancel themselves until this many hours before the session. */
  changeCutoffHours: 2,
  horizonDays: 30,
  /** ISO dates (YYYY-MM-DD) with no availability, e.g. public holidays. */
  closedDates: [] as string[],
  responseTarget: "1 business day",
} as const;

export type Verifiable<T> = { verified: boolean; items: T[] };

/** Awards shown in the hero strip. Hidden until verified. */
export const awards: Verifiable<{ year: string; issuer: string; title: string }> = {
  verified: false,
  items: [
    { year: "2025", issuer: "Forbes", title: "Best Tech Startup" },
    { year: "2024", issuer: "Clutch", title: "Top Software Dev" },
    { year: "2024", issuer: "G2 Crowd", title: "High Performer" },
    { year: "2023", issuer: "Deloitte", title: "Fast 500" },
    { year: "2023", issuer: "Inc. 5000", title: "Fastest Growing" },
  ],
};

/** Capability strip shown instead of awards while they are unverified. */
export const capabilityStrip = [
  { label: "Custom Software", icon: "code" },
  { label: "AI Agents", icon: "bot" },
  { label: "LMS & ERP", icon: "boxes" },
  { label: "CI/CD & DevOps", icon: "git-branch" },