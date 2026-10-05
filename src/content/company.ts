export const changelog = [
  {
    version: "1.0.0",
    date: "2026-10-06",
    title: "New Astareo website",
    changes: [
      "Complete multi-page website: solutions, industries, case studies, blog, resources and company pages.",
      "Online consultation booking with live availability and calendar (.ics) invites.",
      "Astareo Assistant: an AI agent that answers questions, qualifies projects and books consultations.",
      "Contact, partner and careers forms with spam protection and email notifications.",
      "Admin console for leads, consultations, conversations, applications and subscribers.",
      "Site-wide search, sitemap, structured data and security headers.",
    ],
  },
] as const;

export type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

/** Real, currently open roles. Leave empty if none: the careers page then shows the open-application form. */
export const openRoles: Role[] = [];

export const hiringAreas = [
  { title: "Software Engineering", desc: "Full-stack, backend and mobile engineers (TypeScript, Python, Go)." },
  { title: "AI & Data", desc: "Applied AI engineers, data engineers and evaluation specialists." },
  { title: "DevOps & Cloud", desc: "Platform, SRE and security engineers." },
  { title: "Product & Design", desc: "Product managers, UX and visual designers." },
  { title: "Delivery & QA", desc: "Project managers, business analysts and test engineers." },
] as const;

export const perks = [
  "Remote-friendly work with overlap hours",
  "Learning budget and mentoring",
  "Work on varied products across industries",
  "Clear engineering standards and code review",
] as const;

export const engagementModels = [
  {
    name: "Fixed-scope project",
    tag: "Best for well-defined products",
    desc: "A written scope, timeline and price for a defined outcome, delivered in milestones.",
    points: ["Free assessment and written scope", "Milestone-based payments", "Change requests handled transparently", "Warranty period after launch"],
  },
  {
    name: "Dedicated team",
    tag: "Most popular",
    desc: "A cross-functional squad embedded with your organisation on a monthly basis.",
    points: ["Engineers, QA and a delivery lead", "Flexible scope with sprint planning", "Scale the team up or down", "Direct access to the team"],
    featured: true,
  },
  {
    name: "Support retainer",
    tag: "For live products",
    desc: "Ongoing maintenance, monitoring, security updates and feature work for systems already in production.",
    points: ["Agreed response targets", "Security patching & dependency updates", "Monthly hours you can allocate", "Quarterly roadmap review"],
  },
] as const;

export const pricingFaqs = [
  { q: "Why is there no price list?", a: "Software cost depends on scope, integrations and compliance needs. We give a free project assessment and a written estimate so you pay for what you need." },
  { q: "How is a project priced?", a: "Fixed price per milestone, or a monthly rate for a dedicated team or retainer. The proposal states what is and is not included." },
  { q: "Do you sign NDAs?", a: "Yes. We are happy to sign a mutual NDA before the discovery call." },
  { q: "What payment methods do you accept?", a: "Bank transfer and major online payment methods, invoiced in the currency agreed in the contract." },
  { q: "Do I own the code?", a: "Yes, on payment as defined in the contract. Repositories and infrastructure code are delivered to you." },
] as const;

export const partnerTracks = [
  { title: "Technology partners", desc: "Platform and SaaS vendors that want certified delivery capacity or integration expertise." },
  { title: "Referral partners", desc: "Consultancies, agencies and advisors who introduce clients that need software engineering." },
  { title: "Delivery partners", desc: "Agencies that need a white-label or co-delivery engineering team for larger projects." },
] as const;

export const pressFacts = {
  boilerplate:
    "Astareo is a software engineering company that builds custom enterprise software, AI agents, learning and resource-planning platforms, publishing and ticketing systems, and delivery pipelines for growing businesses. Founded in 2020 and based in Bangladesh, Astareo works with organisations across Asia, Europe and the Americas.",
  mediaEmail: "contact@astareo.com",
};
