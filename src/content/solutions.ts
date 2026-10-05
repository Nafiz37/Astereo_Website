export type Solution = {
  slug: string;
  name: string;
  navName: string;
  navDesc: string;
  icon: string;
  tagline: string;
  summary: string;
  badges: string[];
  isNew?: boolean;
  image: string;
  overview: string;
  features: { title: string; desc: string }[];
  useCases: string[];
  deliverables: string[];
  tech: string[];
  faqs: { q: string; a: string }[];
  industries: string[];
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&h=675&fit=crop&auto=format&q=75`;

export const solutions: Solution[] = [
  {
    slug: "custom-software",
    name: "Custom Software Development",
    navName: "Custom Software",
    navDesc: "Bespoke enterprise applications",
    icon: "code",
    tagline: "Bespoke enterprise applications built to your exact specifications",
    summary: "Bespoke enterprise applications built to your exact specifications with cutting-edge technologies.",
    badges: ["Enterprise-Grade", "Scalable"],
    image: u("photo-1551434678-e076c223a692"),
    overview:
      "Off-the-shelf tools rarely match how your business really works. We design and build web, mobile and back-office applications around your processes, data and users, with architecture that can grow from the first release to millions of records without a rewrite.",
    features: [
      { title: "Product discovery & UX", desc: "Workshops, user journeys and clickable prototypes validated with real users before engineering starts." },
      { title: "Scalable architecture", desc: "Modular monoliths or services, chosen for your team size and load, with clear boundaries and observability." },
      { title: "Integrations & APIs", desc: "REST/GraphQL APIs, SSO, payment gateways, ERP/CRM connectors and legacy-system bridges." },
      { title: "Quality engineering", desc: "Automated tests, code review, performance budgets and security checks in every pull request." },
      { title: "Cloud-native delivery", desc: "Infrastructure as code, containerised deployments and zero-downtime releases." },
      { title: "Modernisation", desc: "Incrementally replace ageing systems using the strangler pattern instead of risky big-bang rewrites." },
    ],
    useCases: ["Internal operations platforms", "Customer & partner portals", "Workflow and approval automation", "SaaS product development", "Legacy application modernisation"],
    deliverables: ["Written scope & architecture", "Source code in your repository", "Infrastructure-as-code", "Test suite & CI pipeline", "Runbooks and documentation"],
    tech: ["TypeScript", "React / Next.js", "Node.js", "Python", "PostgreSQL", "Docker"],
    faqs: [
      { q: "Do we own the source code?", a: "Yes. Code, infrastructure definitions and documentation are delivered into repositories you control." },
      { q: "Can you work with our existing team?", a: "Absolutely. We regularly embed alongside in-house engineers and follow your branching, review and release conventions." },
      { q: "How do you estimate projects?", a: "After discovery we provide a written scope with a phased estimate. Fixed-price or time-and-materials models are both available." },
    ],
    industries: ["healthcare", "finance", "logistics", "manufacturing", "government"],
  },
  {
    slug: "blog-cms",
    name: "Blog & CMS Platforms",
    navName: "Blog Platforms",
    navDesc: "Scalable content management",
    icon: "pen-square",
    tagline: "Fast, SEO-ready content platforms your editors will love",
    summary: "Scalable content management systems with editorial workflows, SEO tooling and performance by design.",
    badges: ["SEO-first", "Editor friendly"],
    image: u("photo-1504711434969-e33886168f5c"),
    overview:
      "A content platform should make publishing effortless and loading instant. We build headless and traditional CMS solutions with roles, approval workflows, scheduled publishing, media management and structured content that can feed your site, apps and newsletters.",
    features: [
      { title: "Editorial workflow", desc: "Drafts, review, approval and scheduling with granular roles and audit trails." },
      { title: "SEO & performance", desc: "Server-rendered pages, structured data, sitemaps and Core Web Vitals budgets built in." },
      { title: "Headless or integrated", desc: "Deliver content to web, mobile apps and email from one structured source." },
      { title: "Media pipeline", desc: "Automatic image optimisation, responsive formats and CDN delivery." },
      { title: "Multilingual publishing", desc: "Translation workflows, locale routing and hreflang handled correctly." },
      { title: "Migration", desc: "Move content from WordPress and other systems with redirects that preserve search rankings." },
    ],
    useCases: ["Corporate blogs and knowledge bases", "Documentation sites", "Multi-brand content hubs", "Membership and gated content"],
    deliverables: ["Content model", "Admin/editor interface", "Theme or front-end", "SEO checklist & redirects map", "Editor training"],
    tech: ["Next.js", "PostgreSQL", "Headless CMS", "Edge CDN", "Search"],