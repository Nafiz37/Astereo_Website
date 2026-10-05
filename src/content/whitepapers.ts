export type Whitepaper = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readMinutes: number;
  keyTakeaways: string[];
  body: string;
};

export const whitepapers: Whitepaper[] = [
  {
    slug: "enterprise-ai-agents-playbook",
    title: "The Enterprise AI Agent Playbook",
    summary: "A step-by-step approach to choosing, building and governing your first production AI agents.",
    date: "2026-09-25",
    readMinutes: 9,
    keyTakeaways: [
      "Start with a narrow, measurable workflow where mistakes are cheap.",
      "Design tools, permissions and approvals before prompts.",
      "Measure resolution, handoff and cost; improve on a fixed cadence.",
    ],
    body: `## Executive summary

AI agents can automate multi-step work, but enterprise value depends less on the model and more on the surrounding system: data access, tools, controls and measurement. This paper outlines a pragmatic path to a first production agent.

## 1. Choose the right first workflow

Good candidates are high-volume, rule-bounded and reversible: password and order-status questions, lead qualification, meeting scheduling, internal knowledge lookup. Avoid workflows with irreversible financial or legal outcomes at the start.

## 2. Define success before building

Pick two or three metrics: containment (resolved without a human), customer satisfaction, handling time and cost per conversation. Record a baseline from current operations.

## 3. Architect around tools, not prompts

An agent is a model plus tools. Each tool is a typed function with validation and permission checks implemented in code. The prompt describes when to use the tools; it never replaces authorisation.

## 4. Ground the agent in your knowledge

Use retrieval over approved documents. Require citations or a clear "I don't know", and route unknowns to a person with the conversation attached.

## 5. Governance

- Log prompts, tool calls and outcomes for audit.
- Review a random sample weekly.
- Maintain an evaluation set that includes adversarial prompts.
- Define who owns the agent and the escalation path.

## 6. Roll out gradually

Run in shadow mode, then assist mode (suggested replies for staff), then limited autonomy for a subset of intents, expanding only when metrics hold.

## Conclusion

Treat an agent like a new team member: scoped responsibilities, supervision, feedback and a clear way to escalate.`,
  },
  {
    slug: "modernising-legacy-systems",
    title: "Modernising Legacy Systems Without a Big-Bang Rewrite",
    summary: "How the strangler pattern, strong tests and incremental delivery reduce risk when replacing ageing software.",
    date: "2026-08-30",
    readMinutes: 8,
    keyTakeaways: [
      "Rewrites fail when they delay value; deliver in slices.",
      "Characterisation tests protect behaviour you do not fully understand.",
      "Move data ownership last, not first.",
    ],
    body: `## Why rewrites fail

Complete rewrites freeze business change while the new system chases a moving target. Hidden behaviour in the old system is rediscovered late and expensively.

## The strangler pattern

Place a routing layer in front of the legacy application. Re-implement one capability at a time in the new system and route traffic gradually. The legacy footprint shrinks until it can be retired.

## Build a safety net

Before changing anything, write characterisation tests that capture current behaviour, including its quirks. Compare old and new outputs in shadow mode.

## Handle data deliberately

Prefer synchronising data between systems during the transition. Switch the system of record for one domain at a time and keep a rollback path.

## Organise for continuous delivery

Automate build, test and deployment first. Small, frequent releases make the migration reversible.

## Measure progress

Track the percentage of traffic served by the new system, defect rates, and delivery lead time, not lines of code replaced.`,
  },
  {
    slug: "secure-by-default-delivery",
    title: "Secure-by-Default Software Delivery",
    summary: "A practical DevSecOps baseline for teams that ship weekly or daily.",
    date: "2026-08-05",
    readMinutes: 7,
    keyTakeaways: [
      "Automate security checks in the pipeline so they run on every change.",
      "Manage secrets and dependencies as first-class risks.",
      "Rehearse incident response before you need it.",
    ],
    body: `## The baseline

Security that depends on manual review does not scale with release frequency. Embed checks into the pipeline so every change is verified consistently.

## Pipeline controls

- Static analysis and linting on every pull request.
- Dependency vulnerability scanning with defined response times.
- Secret scanning with blocking pre-merge checks.
- Container image scanning and minimal base images.
- Signed, reproducible build artefacts.

## Runtime controls

- Least-privilege service identities.
- Network segmentation and TLS everywhere.
- Centralised logging with alerting on anomalous behaviour.
- Backups with periodic restore tests.

## People and process

Run threat-modelling workshops for new features. Keep a short, rehearsed incident-response runbook with named roles. Review access quarterly.

## Mapping to frameworks

These controls support evidence requirements for frameworks such as ISO 27001, SOC 2 and PCI DSS. Framework alignment is not the same as certification: certification requires an independent audit of your organisation.`,
  },
];

export const getWhitepaper = (slug: string) => whitepapers.find((w) => w.slug === slug);
