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