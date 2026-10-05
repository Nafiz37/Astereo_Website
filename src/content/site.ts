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
  { label: "Security-minded engineering", icon: "shield-check" },
] as const;

/**
 * Platforms logos. These are NOT client claims: the section is titled
 * "Platforms we build on & integrate with" unless `clientsVerified` is true.
 */
export const ecosystem = {
  clientsVerified: false,
  items: [
    "Microsoft",
    "Google Cloud",
    "Amazon Web Services",
    "Salesforce",
    "Oracle",
    "SAP",
    "IBM",
    "Stripe",
    "Snowflake",
    "ServiceNow",
    "Workday",
    "Atlassian",
  ],
};

/** Hero/“global reach” numbers. Unverified numbers are replaced by factual catalogue counts. */
export const stats = {
  verified: false,
  claimed: [
    { value: 500, suffix: "+", label: "Enterprise Clients" },
    { value: 99.9, suffix: "%", label: "System Uptime", decimals: 1 },
    { value: 200, suffix: "+", label: "Expert Engineers" },
    { value: 25, suffix: "+", label: "Countries Served" },
  ],
};

export const markets = [
  { flag: "🇧🇩", code: "bd", name: "Bangladesh" },
  { flag: "🇮🇳", code: "in", name: "India" },
  { flag: "🇬🇧", code: "gb", name: "UK" },
  { flag: "🇺🇸", code: "us", name: "USA" },
  { flag: "🇧🇷", code: "br", name: "Brazil" },
  { flag: "🇸🇬", code: "sg", name: "Singapore" },
  { flag: "🇯🇵", code: "jp", name: "Japan" },
] as const;

/**
 * Compliance. `certified` must only be true with a real certificate/attestation.
 * Otherwise the badge reads "Aligned" and the copy says we build to these standards.
 */
export const compliance = [
  { name: "ISO 27001", area: "Information security management", certified: false },
  { name: "SOC 2 Type II", area: "Security, availability & confidentiality controls", certified: false },
  { name: "GDPR", area: "EU personal-data protection", certified: false },
  { name: "HIPAA", area: "US healthcare data safeguards", certified: false },
  { name: "ISO 9001:2015", area: "Quality management", certified: false },
  { name: "PCI DSS", area: "Payment-card data security", certified: false },
  { name: "CSA STAR", area: "Cloud security assurance", certified: false },
  { name: "DNV", area: "Independent assurance", certified: false },
] as const;

export const techStack = [
  { name: "React", icon: "⚛️" },
  { name: "Node.js", icon: "🟢" },
  { name: "Python", icon: "🐍" },
  { name: "TypeScript", icon: "📘" },
  { name: "Cloud (AWS / GCP / Azure)", icon: "☁️" },
  { name: "Docker", icon: "🐳" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "MongoDB", icon: "🍃" },
  { name: "Kubernetes", icon: "⚙️" },
  { name: "Next.js", icon: "◼️" },
  { name: "Redis", icon: "🔴" },
  { name: "Go", icon: "💙" },
] as const;

export const engagementProcess = [
  { step: "01", title: "Discovery", desc: "A free assessment call to understand goals, constraints, users and success metrics." },
  { step: "02", title: "Scope & Architecture", desc: "We turn findings into a written scope, architecture, timeline and a transparent estimate." },
  { step: "03", title: "Build in Sprints", desc: "Two-week sprints with working demos, shared backlog and CI/CD from day one." },
  { step: "04", title: "Launch & Handover", desc: "Staged rollout, monitoring, documentation and knowledge transfer to your team." },
  { step: "05", title: "Support & Evolve", desc: "Ongoing maintenance, security patching and roadmap delivery on a retainer." },
] as const;

export const values = [
  { title: "Reliability first", desc: "Boring, well-tested engineering that keeps running when it matters." },
  { title: "Honest communication", desc: "Plain-language estimates, early risk flags and no surprise invoices." },
  { title: "Security by default", desc: "Least privilege, encrypted data paths and dependency hygiene in every build." },
  { title: "You own what we build", desc: "Source code, infrastructure-as-code and documentation are handed over to you." },
] as const;

export const services = [
  "Custom Software Development",
  "AI Agent Integration",
  "LMS Platforms",
  "ERP Solutions",
  "Blog & CMS Platforms",
  "News Portal Solutions",
  "Ticketing Platforms",
  "DevOps & CI/CD",
  "Not sure yet",
] as const;

export const budgets = ["Under $5k", "$5k – $15k", "$15k – $50k", "$50k – $150k", "$150k+", "Not sure yet"] as const;
export const timelines = ["ASAP (< 1 month)", "1–3 months", "3–6 months", "6+ months", "Just exploring"] as const;
