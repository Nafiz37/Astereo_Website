/**
 * Case studies.
 *
 * `verified: false`  -> shown as a "Representative engagement": the scenario and approach are
 *                       described, but result metrics are hidden.
 * `verified: true`   -> real, client-approved result. Set this (and fill `client`) only with
 *                       written client permission and numbers you can back up.
 */
export type CaseStudy = {
  slug: string;
  title: string;
  initial: string;
  industry: string;
  solution: string;
  image: string;
  challenge: string;
  solutionSummary: string;
  approach: string[];
  deliverables: string[];
  tech: string[];
  metrics: { value: string; label: string }[];
  verified: boolean;
  client?: string;
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=1000&h=640&fit=crop&auto=format&q=75`;

export const caseStudies: CaseStudy[] = [
  {
    slug: "enterprise-custom-solution",
    title: "Enterprise Custom Solution",
    initial: "E",
    industry: "Multinational enterprise",
    solution: "custom-software",
    image: u("photo-1551434678-e076c223a692"),
    challenge: "A multinational corporation needed a comprehensive custom software solution to streamline global operations across 20+ countries.",
    solutionSummary:
      "A fully customised enterprise platform with multi-language support, real-time analytics and seamless integration with existing systems.",
    approach: ["Country-by-country process mapping and a shared domain model", "Multi-language, multi-currency core with role-based access", "Event-driven integrations with the existing ERP and identity provider", "Phased rollout starting with two pilot countries"],
    deliverables: ["Operations platform", "Analytics dashboards", "Integration layer", "Rollout & training plan"],
    tech: ["React", "Node.js", "PostgreSQL", "Kubernetes"],
    metrics: [{ value: "60%", label: "improvement in operational efficiency" }],
    verified: false,
  },
  {
    slug: "edtech-learning-platform",
    title: "EdTech Learning Platform",
    initial: "E",
    industry: "Education",
    solution: "lms",
    image: u("photo-1501504905252-473c47e087f8"),
    challenge: "An educational institution sought to modernise learning delivery with an interactive online platform serving 100,000+ students.",
    solutionSummary: "A comprehensive LMS with live virtual classrooms, AI-powered learning paths, automated assessments and SCORM compliance.",
    approach: ["Load-tested architecture for exam-day concurrency", "SCORM import so existing content remained usable", "Learning-path recommendations with instructor override", "Accessibility review against WCAG 2.2 AA"],
    deliverables: ["Learner and instructor apps", "Assessment engine", "Admin & reporting console"],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Video streaming"],
    metrics: [{ value: "85%", label: "increase in student engagement" }],
    verified: false,
  },
  {
    slug: "manufacturing-erp-system",
    title: "Manufacturing ERP System",
    initial: "M",
    industry: "Manufacturing",
    solution: "erp",
    image: u("photo-1460925895917-afdab827c52f"),
    challenge: "A manufacturing company required an integrated ERP solution to manage inventory, HR, finance and production across multiple facilities.",
    solutionSummary: "A modular ERP with real-time inventory tracking, automated procurement and comprehensive reporting.",
    approach: ["Module-by-module rollout beginning with inventory", "Barcode-driven stock movements on rugged mobile devices", "Automated reorder rules and approval workflows", "Finance integration with automated reconciliation"],
    deliverables: ["Inventory & procurement modules", "Production planning", "Finance & HR modules", "Management reports"],
    tech: ["TypeScript", "PostgreSQL", "Python", "BI tooling"],
    metrics: [{ value: "40%", label: "reduction in operational costs" }],
    verified: false,
  },
  {
    slug: "digital-news-platform",
    title: "Digital News Platform",
    initial: "D",
    industry: "Media & Publishing",
    solution: "news-portal",
    image: u("photo-1504711434969-e33886168f5c"),
    challenge: "A media company needed a high-performance news portal capable of handling millions of daily visitors with real-time content updates.",
    solutionSummary: "A scalable news platform with real-time publishing, personalised feeds, SEO optimisation and advanced analytics.",
    approach: ["Edge caching with instant purge on publish", "Newsroom workflow with breaking-news mode", "Search and recommendation services isolated from the read path", "Load tests simulating viral traffic"],
    deliverables: ["Newsroom CMS", "Reader site", "Analytics dashboards"],
    tech: ["Next.js", "Redis", "PostgreSQL", "CDN"],
    metrics: [{ value: "99.99%", label: "uptime" }, { value: "3x", label: "traffic growth" }],
    verified: false,
  },
  {
    slug: "event-ticketing-platform",
    title: "Event Ticketing Platform",
    initial: "E",
    industry: "Events",
    solution: "ticketing",
    image: u("photo-1540575467063-178a50c2df87"),
    challenge: "An event management company required a robust ticketing solution for concerts, conferences and sporting events with high-volume sales capability.",
    solutionSummary: "A comprehensive ticketing platform with real-time seat selection, secure payments, QR code validation and CRM integration.",
    approach: ["Inventory locking to prevent double-selling", "Virtual waiting room for on-sale spikes", "Signed QR tickets with offline-tolerant scanning", "CRM sync of buyers and campaigns"],
    deliverables: ["Buyer web app", "Organiser dashboard", "Scanner app", "CRM connector"],
    tech: ["TypeScript", "PostgreSQL", "Redis", "Payment gateways"],
    metrics: [{ value: "500K+", label: "tickets processed" }],
    verified: false,
  },
  {
    slug: "ai-customer-support",
    title: "AI Customer Support",
    initial: "A",
    industry: "Customer service",
    solution: "ai-agents",
    image: u("photo-1677442136019-21780ecad995"),
    challenge: "A service company wanted to automate customer support operations while keeping satisfaction high across multiple channels.",
    solutionSummary: "AI-powered support agents with natural language understanding, intelligent routing and seamless human handoff.",
    approach: ["Grounded answers from the company knowledge base", "Intent routing and confidence thresholds", "Human handoff with full conversation context", "Offline evaluation set and weekly quality review"],
    deliverables: ["Support agent", "Routing rules", "Agent-assist console", "Quality dashboard"],
    tech: ["LLM APIs", "TypeScript", "PostgreSQL", "Vector search"],
    metrics: [{ value: "80%", label: "faster response time" }, { value: "95%", label: "satisfaction" }],
    verified: false,
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
