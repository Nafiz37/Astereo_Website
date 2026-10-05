export type Industry = {
  slug: string;
  name: string;
  navName?: string;
  navDesc?: string;
  emoji: string;
  headline: string;
  image: string;
  overview: string;
  challenges: string[];
  offerings: { solution: string; how: string }[];
  considerations: string;
};

const u = (id: string) => `https://images.unsplash.com/${id}?w=1000&h=640&fit=crop&auto=format&q=75`;

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    navName: "Healthcare",
    navDesc: "HIPAA-aligned solutions",
    emoji: "🏥",
    headline: "HIPAA-Compliant Healthcare Solutions That Transform Patient Care",
    image: u("photo-1576091160550-2173dba999ef"),
    overview:
      "Clinics, hospitals and health-tech companies need software that is dependable, auditable and respectful of patient privacy. We build patient portals, scheduling and records integrations, telehealth workflows and clinical training platforms.",
    challenges: ["Protecting sensitive patient data end to end", "Integrating with EHR/EMR and lab systems (HL7/FHIR)", "Reducing administrative load on clinical staff", "Auditability and access logging"],
    offerings: [
      { solution: "custom-software", how: "Patient portals, appointment and records workflows, FHIR/HL7 integrations." },
      { solution: "lms", how: "Clinical training, compliance courses and CPD tracking." },
      { solution: "ai-agents", how: "Appointment assistants and document summarisation with strict human review." },
    ],
    considerations:
      "We design to HIPAA safeguards (access control, encryption, audit logging, minimum necessary). Formal compliance depends on your organisation's policies and agreements; we provide the technical controls and documentation.",
  },
  {
    slug: "finance",
    name: "Finance & Banking",
    navName: "Finance",
    navDesc: "Secure fintech platforms",
    emoji: "💳",
    headline: "Secure Fintech Platforms Built for Trust and Compliance",
    image: u("photo-1611974789855-9c2a0a7236a3"),
    overview:
      "Financial products succeed on trust. We build onboarding flows, internal operations tools, reconciliation systems and customer dashboards with strong authentication, immutable audit trails and careful handling of money movement.",
    challenges: ["Strong customer authentication and fraud controls", "Reliable ledgers and reconciliation", "Regulatory reporting", "Zero-downtime releases for critical paths"],
    offerings: [
      { solution: "custom-software", how: "Ledgers, onboarding/KYC flows, dashboards and partner APIs." },
      { solution: "ai-agents", how: "Support triage and document review with approval gates." },
      { solution: "devops-cicd", how: "Controlled, audited deployments with security scanning." },
    ],
    considerations: "Payment features are built around PCI DSS-aligned practices (tokenisation via certified gateways, no card data stored by us).",
  },
  {
    slug: "education",
    name: "Education & EdTech",
    navName: "Education",
    navDesc: "EdTech & e-learning",
    emoji: "📚",
    headline: "Interactive Learning Platforms That Inspire and Engage",
    image: u("photo-1503676260728-1c00da094a0b"),
    overview: "From universities to training startups, we build LMS platforms, virtual classrooms, assessment engines and student information systems that scale to large cohorts.",
    challenges: ["Engagement and completion rates", "Large concurrent exam sessions", "Standards-based content (SCORM/xAPI)", "Student data privacy"],
    offerings: [
      { solution: "lms", how: "Courses, live classes, assessments and analytics." },
      { solution: "erp", how: "Admissions, fees, HR and academic operations." },
      { solution: "ai-agents", how: "Tutoring assistants and learner support." },
    ],
    considerations: "We apply data-minimisation and parental-consent patterns where learners are minors, and design for GDPR/COPPA-style requirements.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce & Retail",
    navName: "E-commerce",
    navDesc: "Scalable retail solutions",
    emoji: "🛒",
    headline: "Scalable E-commerce Solutions for Global Retail Success",
    image: u("photo-1556742049-0cfed4f6a45d"),
    overview: "We build storefronts, marketplaces, order-management and inventory systems that stay fast during campaigns and integrate with payments, couriers and ERPs.",
    challenges: ["Peak-season traffic", "Inventory accuracy across channels", "Conversion and checkout performance", "Multi-currency and tax"],
    offerings: [
      { solution: "custom-software", how: "Storefronts, marketplaces and order management." },
      { solution: "erp", how: "Inventory, procurement and finance back office." },
      { solution: "ai-agents", how: "Shopping assistants and support automation." },
    ],
    considerations: "Payments use certified gateways so card data never touches your servers.",
  },
  {
    slug: "media",
    name: "Media & Publishing",
    navName: "Media & Publishing",
    navDesc: "Content delivery platforms",
    emoji: "📰",
    headline: "High-Performance Content Platforms for Modern Publishing",
    image: u("photo-1504711434969-e33886168f5c"),
    overview: "Publishers need speed, reliable editorial tools and revenue options. We deliver news portals, CMS platforms, subscriptions and ticketing for live events.",
    challenges: ["Traffic spikes", "Editorial efficiency", "Monetisation", "SEO and distribution"],
    offerings: [
      { solution: "news-portal", how: "Real-time newsroom and reader platform." },
      { solution: "blog-cms", how: "Structured, SEO-first content hubs." },
      { solution: "ticketing", how: "Event sales and entry management." },
    ],
    considerations: "Reader privacy: consent management and minimal analytics by default.",
  },
  {
    slug: "government",
    name: "Government & Public Sector",
    navName: "Government",
    navDesc: "Public sector solutions",
    emoji: "🏛️",
    headline: "Secure Government Solutions Meeting Strict Compliance Standards",
    image: u("photo-1523292562811-8fa7962a78c8"),
    overview: "Public bodies need accessible, transparent and resilient digital services. We build citizen portals, case-management systems and internal workflow tools with strong security and accessibility.",
    challenges: ["Accessibility (WCAG) obligations", "Procurement and documentation requirements", "Legacy integrations", "Data sovereignty"],
    offerings: [
      { solution: "custom-software", how: "Citizen services and case management." },
      { solution: "news-portal", how: "Public information and notices." },
      { solution: "lms", how: "Civil service training." },
    ],
    considerations: "We target WCAG 2.2 AA and can deploy to in-country or on-premise infrastructure when data-residency rules require it.",
  },
  {
    slug: "logistics",
    name: "Logistics & Supply Chain",
    navName: "Logistics",
    emoji: "🚚",
    headline: "Smart Supply Chain Solutions for Operational Excellence",
    image: u("photo-1586528116311-ad8dd3c8310d"),
    overview: "Visibility and automation across warehouses, fleets and suppliers. We build tracking, dispatch, warehouse and procurement systems with real-time status and exception alerts.",
    challenges: ["End-to-end shipment visibility", "Warehouse accuracy", "Route and dispatch efficiency", "Supplier collaboration"],
    offerings: [
      { solution: "erp", how: "Warehouse, procurement and finance." },
      { solution: "custom-software", how: "Tracking, dispatch and partner portals." },
      { solution: "ai-agents", how: "Exception handling and customer status bots." },
    ],
    considerations: "Offline-tolerant mobile apps for warehouse and driver use.",
  },
  {
    slug: "real-estate",
    name: "Real Estate & PropTech",
    navName: "Real Estate",
    emoji: "🏢",
    headline: "PropTech Innovations Transforming Real Estate Management",
    image: u("photo-1560518883-ce09059eeffa"),
    overview: "Property platforms need listings, leads, leasing and maintenance flows that agents and tenants enjoy using. We build listing portals, CRM, tenant apps and property-management back offices.",
    challenges: ["Lead follow-up speed", "Lease and maintenance workflows", "Data accuracy across listings", "Payments and reporting"],
    offerings: [
      { solution: "custom-software", how: "Listings, CRM and tenant portals." },
      { solution: "erp", how: "Billing, accounting and facilities." },
      { solution: "ai-agents", how: "Enquiry qualification and viewing scheduling." },
    ],
    considerations: "Document e-signature and KYC integrations via specialised providers.",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    navName: "Manufacturing",
    emoji: "🏭",
    headline: "Industry 4.0 Solutions for Modern Manufacturing",
    image: u("photo-1581091226825-a6a2a5aee158"),
    overview: "We connect shop-floor data to planning and finance: ERP, MES-style tracking, quality management and analytics for multi-plant manufacturers.",
    challenges: ["Production visibility", "Inventory and BOM accuracy", "Quality and traceability", "Multi-site rollouts"],
    offerings: [
      { solution: "erp", how: "Modular ERP with production planning." },
      { solution: "custom-software", how: "Shop-floor and quality applications." },
      { solution: "devops-cicd", how: "Reliable releases and edge deployment." },
    ],
    considerations: "We integrate with PLC/IoT gateways via standard protocols such as MQTT and OPC UA.",
  },
  {
    slug: "insurance",
    name: "Insurance",
    navName: "Insurance",
    emoji: "🛡️",
    headline: "Digital-First Insurance Platforms for the Modern Era",
    image: u("photo-1450101499163-c8848c66ca85"),
    overview: "Modern insurers need quote-to-claim journeys that are fast and transparent. We build policy administration, claims workflows, broker portals and document automation.",
    challenges: ["Claims turnaround", "Underwriting rules complexity", "Broker and partner integrations", "Fraud detection"],
    offerings: [
      { solution: "custom-software", how: "Policy admin, claims and broker portals." },
      { solution: "ai-agents", how: "Document extraction and claims triage with human sign-off." },
      { solution: "devops-cicd", how: "Controlled release processes." },
    ],
    considerations: "Decisioning remains rule-governed and auditable; AI assists but does not make final coverage decisions.",
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
