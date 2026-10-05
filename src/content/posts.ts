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