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
    faqs: [
      { q: "Can you migrate our existing WordPress site?", a: "Yes. We map content types, migrate media and set up 301 redirects so rankings are preserved." },
      { q: "Can non-technical staff publish?", a: "That is the design goal. We build editor-first interfaces and train your team." },
    ],
    industries: ["media", "education", "ecommerce"],
  },
  {
    slug: "news-portal",
    name: "News Portal Solutions",
    navName: "News Portals",
    navDesc: "Real-time publishing systems",
    icon: "newspaper",
    tagline: "High-performance publishing for millions of readers",
    summary: "Real-time publishing systems built for traffic spikes, breaking news and monetisation.",
    badges: ["High traffic", "Real-time"],
    image: u("photo-1504711434969-e33886168f5c"),
    overview:
      "News traffic is unpredictable. Our portals combine aggressive caching, edge delivery and a fast newsroom workflow so stories go live in seconds and stay online when a headline goes viral.",
    features: [
      { title: "Newsroom workflow", desc: "Live editing, breaking-news flags, embargo and scheduled releases." },
      { title: "Traffic-spike resilience", desc: "Edge caching, stale-while-revalidate and load testing to protect uptime." },
      { title: "Personalised feeds", desc: "Topic, location and reading-history based recommendations." },
      { title: "Monetisation", desc: "Ad slots, paywalls/metering, newsletters and membership." },
      { title: "Analytics", desc: "Real-time dashboards for editors on what is being read and shared." },
      { title: "SEO & distribution", desc: "News sitemaps, AMP-free fast pages, RSS and social previews." },
    ],
    useCases: ["Digital newspapers", "Broadcast websites", "Niche publications", "Government communication portals"],
    deliverables: ["Newsroom CMS", "Reader front-end", "Ad & subscription integration", "Load-test report", "Monitoring dashboards"],
    tech: ["Next.js", "Redis", "PostgreSQL", "CDN", "Search"],
    faqs: [{ q: "How do you handle sudden traffic spikes?", a: "We cache aggressively at the edge, keep the database off the hot read path and verify with load tests before launch." }],
    industries: ["media", "government"],
  },
  {
    slug: "ticketing",
    name: "Ticketing Platforms",
    navName: "Ticketing Systems",
    navDesc: "Event & support platforms",
    icon: "ticket",
    tagline: "Event ticketing and support ticketing that stay fast under load",
    summary: "Event sales with seat selection and QR validation, plus helpdesk ticketing with SLAs and routing.",
    badges: ["High-volume sales", "QR validation"],
    image: u("photo-1540575467063-178a50c2df87"),
    overview:
      "Whether you sell concert seats or resolve customer issues, ticketing is about correctness under pressure: no double-selling, no lost requests. We build both event-ticketing and support-ticketing systems with inventory locking, payments, notifications and reporting.",
    features: [
      { title: "Seat maps & inventory locks", desc: "Real-time seat selection with time-boxed holds to prevent double booking." },
      { title: "Payments", desc: "Gateway integrations with webhooks, refunds and reconciliation reports." },
      { title: "QR & mobile entry", desc: "Signed QR tickets with offline-tolerant scanning apps." },
      { title: "Helpdesk workflows", desc: "Queues, SLAs, escalation, canned replies and customer portals." },
      { title: "CRM & email integration", desc: "Sync buyers and requesters to your CRM and communication tools." },
      { title: "Fraud & abuse controls", desc: "Rate limiting, bot protection and purchase limits for high-demand drops." },
    ],
    useCases: ["Concerts and conferences", "Sports events", "IT & customer support desks", "Internal service management"],
    deliverables: ["Buyer web app", "Organiser dashboard", "Scanning app", "Payment integration", "Reporting"],
    tech: ["TypeScript", "PostgreSQL", "Redis", "Payment gateways", "WebSockets"],
    faqs: [{ q: "Can it support flash sales?", a: "Yes. We design queueing and inventory locking specifically for demand spikes and test with realistic load." }],
    industries: ["media", "ecommerce", "government"],
  },
  {
    slug: "lms",
    name: "LMS Platforms",
    navName: "LMS Platforms",
    navDesc: "Learning management ecosystems",
    icon: "graduation-cap",
    tagline: "Interactive learning platforms that inspire and engage",
    summary: "Learning management ecosystems with live classes, assessments, SCORM support and analytics.",
    badges: ["SCORM", "Live classes"],
    image: u("photo-1501504905252-473c47e087f8"),
    overview:
      "We build learning platforms for universities, training companies and corporate academies: course authoring, live virtual classrooms, assessments, certificates and the analytics that show whether learning is actually happening.",
    features: [
      { title: "Course authoring", desc: "Modules, video, documents, quizzes and drip scheduling." },
      { title: "Live virtual classrooms", desc: "Integrated video classes, recordings and attendance tracking." },
      { title: "Assessments & grading", desc: "Question banks, auto-grading, proctoring hooks and rubrics." },
      { title: "SCORM / xAPI", desc: "Import and track standards-based content from existing libraries." },
      { title: "AI-assisted learning paths", desc: "Recommendations, tutoring assistants and content summarisation." },
      { title: "Analytics & certification", desc: "Progress dashboards, cohort reports and verifiable certificates." },
    ],
    useCases: ["Universities and schools", "Corporate training", "Professional certification", "Online academies"],
    deliverables: ["Learner & instructor apps", "Admin console", "Standards import", "Reporting suite", "SSO integration"],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Video streaming", "SCORM"],
    faqs: [{ q: "Can we reuse existing SCORM courses?", a: "Yes. We support SCORM packages so your existing content library keeps working." }],
    industries: ["education", "healthcare", "government"],
  },
  {
    slug: "erp",
    name: "ERP Solutions",
    navName: "ERP Solutions",
    navDesc: "End-to-end resource planning",
    icon: "boxes",
    tagline: "Modular ERP that matches how your operations actually run",
    summary: "End-to-end resource planning: inventory, HR, finance and production in one modular system.",
    badges: ["Modular", "Multi-site"],
    image: u("photo-1460925895917-afdab827c52f"),
    overview:
      "Instead of forcing your processes into a rigid package, we build modular ERP systems that cover the areas you need first (inventory, procurement, HR, finance, production) and extend as you grow, with integrations to the tools you already use.",
    features: [
      { title: "Inventory & warehouse", desc: "Multi-location stock, batch/serial tracking and reorder automation." },
      { title: "Procurement", desc: "Requisitions, approvals, supplier management and purchase orders." },
      { title: "Finance & accounting", desc: "Ledgers, invoicing, tax handling and bank reconciliation." },
      { title: "HR & payroll", desc: "Employee records, attendance, leave and payroll integration." },
      { title: "Production planning", desc: "Bills of materials, work orders and capacity planning." },
      { title: "Reporting", desc: "Role-based dashboards and exportable operational reports." },
    ],
    useCases: ["Manufacturing", "Distribution & wholesale", "Multi-branch retail", "Service businesses"],
    deliverables: ["Process mapping", "Modular ERP", "Data migration", "Role-based access", "Training"],
    tech: ["TypeScript", "PostgreSQL", "Python", "Event queues", "BI tooling"],
    faqs: [{ q: "Can you integrate with SAP, Oracle or Odoo?", a: "Yes. We build connectors and migration paths so you can adopt modules gradually." }],
    industries: ["manufacturing", "logistics", "ecommerce", "real-estate"],
  },
  {
    slug: "ai-agents",
    name: "AI Agent Integration",
    navName: "AI Agents",
    navDesc: "Intelligent workflow automation",
    icon: "bot",
    tagline: "AI agents that do real work inside your systems",
    summary: "Intelligent workflow automation: support agents, document processing and internal copilots with human handoff.",
    badges: ["Tool-using agents", "Human handoff"],
    isNew: true,
    image: u("photo-1677442136019-21780ecad995"),
    overview:
      "We design AI agents that connect to your data and tools: answering customers, qualifying leads, processing documents and automating internal workflows. Every agent ships with guardrails, evaluation, observability and a clean human handoff so automation never becomes a liability.",
    features: [
      { title: "Support & sales agents", desc: "Multi-channel assistants that resolve common requests, qualify leads and book meetings." },
      { title: "Tool use & integrations", desc: "Agents that call your APIs, databases and SaaS tools through typed, permissioned functions." },
      { title: "Retrieval over your knowledge", desc: "Grounded answers with citations from your documents and knowledge base." },
      { title: "Guardrails & evaluation", desc: "Prompt-injection defences, output validation and automated test sets." },
      { title: "Human in the loop", desc: "Confidence thresholds, approval steps and seamless escalation to staff." },
      { title: "Cost & observability", desc: "Tracing, usage budgets and model selection tuned for cost and quality." },
    ],
    useCases: ["Customer support automation", "Lead qualification & scheduling", "Document extraction & review", "Internal knowledge copilots", "Back-office workflow automation"],
    deliverables: ["Agent design & guardrails", "Tool/API layer", "Evaluation suite", "Monitoring dashboard", "Playbook for operations"],
    tech: ["LLM APIs (Gemini, others)", "TypeScript / Python", "Vector search", "PostgreSQL", "Observability"],
    faqs: [
      { q: "Will an AI agent make mistakes?", a: "It can. That is why we add grounding, validation, evaluation sets and human escalation, and we start with low-risk workflows." },
      { q: "Is our data used to train models?", a: "We choose providers and settings so your data is not used for model training, and we minimise what is sent." },
    ],
    industries: ["finance", "healthcare", "ecommerce", "insurance"],
  },
  {
    slug: "devops-cicd",
    name: "DevOps & CI/CD",
    navName: "CI/CD Pipeline",
    navDesc: "Fast, reliable deployments",
    icon: "git-branch",
    tagline: "Ship faster with pipelines you can trust",
    summary: "Fast, reliable deployments: automated pipelines, infrastructure as code and observability.",
    badges: ["Automation", "Observability"],
    image: u("photo-1551434678-e076c223a692"),
    overview:
      "Slow, manual releases hide risk. We build CI/CD pipelines, containerised environments and cloud infrastructure so every change is tested, scanned and deployed the same way every time, with monitoring that tells you about problems before customers do.",
    features: [