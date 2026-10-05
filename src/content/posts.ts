/** Blog posts (git-based CMS). Add an entry, commit, deploy. Body is simple Markdown. */
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  tags: string[];
  readMinutes: number;
  body: string;
};

export const posts: Post[] = [
  {
    slug: "how-to-scope-a-custom-software-project",
    title: "How to scope a custom software project without surprises",
    excerpt: "A practical checklist for turning a vague idea into a scope you can estimate, budget and hold a team accountable to.",
    date: "2026-09-18",
    author: "Astareo Engineering",
    tags: ["Custom Software", "Planning"],
    readMinutes: 6,
    body: `Most budget overruns are decided in the first two weeks, before any code is written. Scope is where they are won or lost.

## Start with outcomes, not features

Write down the three business outcomes the software must achieve, for example "cut invoice processing from five days to one". Features are hypotheses about how to reach an outcome; keeping the outcome visible lets you swap features without re-arguing the project.

## Map users and their top jobs

List each type of user and the five most important things they need to do. This produces a realistic first release instead of a wish list.

## Separate must-have, should-have and later

- **Must-have:** the product has no value without it.
- **Should-have:** important, but there is a workaround for the first release.
- **Later:** good ideas that should be recorded and not built yet.

## Name the integrations early

Every external system (payments, identity, ERP, email) adds risk and time. Identify them, get sandbox access, and read their rate limits before estimating.

## Decide how you will measure done

Agree on acceptance criteria and a small set of non-functional targets: page-load time, concurrent users, recovery time and data-retention rules.

## Ask for a phased estimate

A single number hides uncertainty. Ask for a range per phase, with the assumptions behind it, and revisit after each sprint demo.

If you want a second pair of eyes on your scope, our free project assessment is built for exactly this.`,
  },
  {
    slug: "building-ai-agents-that-are-safe-to-ship",
    title: "Building AI agents that are safe to ship",
    excerpt: "Tool-using agents are powerful and risky. These are the guardrails we put in place before any agent talks to a customer.",
    date: "2026-09-02",
    author: "Astareo Engineering",
    tags: ["AI Agents", "Security"],
    readMinutes: 7,
    body: `An AI agent is a language model that can take actions: look up orders, create tickets, book meetings. The moment a model can act, mistakes and manipulation have real consequences.

## 1. Give tools the smallest possible power

Each tool should do one thing, validate its inputs with a strict schema, and enforce permissions in code, never in the prompt. If a tool should only create bookings in the future, the tool must reject past dates.

## 2. Treat all user text as untrusted

Users, documents and web pages can contain instructions aimed at the model ("ignore your rules and..."). Keep system instructions separate, never give the model secrets it does not need, and never rely on the model to enforce security.

## 3. Ground answers in your data

Retrieval over your own documents reduces invented answers. Require the agent to say it does not know, and hand off to a person instead.

## 4. Put humans in the loop for consequences

Low-risk actions can run automatically. Anything involving money, deletion or commitments should require confirmation or approval.

## 5. Evaluate continuously

Build a test set of real conversations, including adversarial ones, and run it on every prompt or model change. Track resolution rate, handoff rate and cost per conversation.

## 6. Limit cost and abuse

Rate limit per visitor, cap message length and tool-call loops, and log every tool call for audit.

Start with a narrow, low-risk workflow, measure it, then expand.`,
  },
  {
    slug: "ci-cd-metrics-that-matter",
    title: "Four CI/CD metrics that actually predict delivery health",
    excerpt: "Deployment frequency, lead time, change failure rate and time to restore. How to measure them and what to fix first.",
    date: "2026-08-14",
    author: "Astareo Engineering",
    tags: ["DevOps", "CI/CD"],
    readMinutes: 5,
    body: `Teams that ship small changes often tend to be more stable, not less. Four widely used measures (popularised by the DORA research programme) make this visible.

## Deployment frequency

How often you release to production. Aim for on-demand releases. If you deploy monthly, the biggest lever is usually shrinking batch size.

## Lead time for changes

Time from commit to production. Long lead times usually come from slow tests, manual approvals or environment contention.

## Change failure rate

The share of deployments that cause an incident or a rollback. Improve it with automated tests, feature flags and progressive rollouts.

## Time to restore service

How quickly you recover when something breaks. Invest in monitoring, one-click rollback and rehearsed runbooks.

## Where to start

Measure all four for a month before changing anything. Fix the worst one, remeasure, repeat. Resist optimising a metric in isolation: the four are meant to be read together.`,
  },
  {
    slug: "choosing-between-lms-build-and-buy",
    title: "LMS: should you build or buy?",
    excerpt: "Off-the-shelf learning platforms are great until they are not. A framework for deciding when custom is worth it.",
    date: "2026-07-22",
    author: "Astareo Engineering",
    tags: ["LMS", "Strategy"],
    readMinutes: 5,
    body: `Buying an LMS is usually the right first move. Building makes sense when the platform is part of your product or your processes are unusual.

## Buy when

- Your needs are mainstream: courses, quizzes, certificates.
- You need to launch within weeks.
- You do not have engineers to maintain a platform.

## Build when

- Learning is your product and the experience is a differentiator.
- You need deep integration with your own systems (billing, CRM, HR, credentialing).
- Per-user licence costs will exceed the cost of ownership at your scale.
- You have strict data-residency or accessibility requirements that vendors cannot meet.

## The hybrid path

Many organisations keep a commercial LMS for content delivery and build custom portals, reporting or integrations around it using APIs and SCORM/xAPI. It lowers risk and keeps the option to replace parts later.

## Questions to answer first

1. What does the first year cost under each option, including integrations?
2. What happens to your data if the vendor changes pricing?
3. Which features are truly unique to you?`,
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
