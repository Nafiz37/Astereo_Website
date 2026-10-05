/** Technical guides ("Documentation") - how Astareo engagements work and what we expect/deliver. */
export type Doc = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  body: string;
};

export const docs: Doc[] = [
  {
    slug: "getting-started",
    title: "Getting started with Astareo",
    summary: "What happens between your first message and your first release.",
    category: "Engagement",
    body: `## 1. Free project assessment

Book a consultation from the website. We ask about goals, users, existing systems, constraints and timeline. You receive a short written summary and next-step recommendation. There is no commitment.

## 2. Scope and proposal

We produce a written scope, architecture sketch, phased estimate and team plan. Proposals state assumptions explicitly so changes are easy to discuss.

## 3. Kick-off

We agree communication channels, working hours overlap, access requirements and the definition of done. You get a shared backlog and a demo cadence.

## 4. Delivery

Work runs in two-week sprints. Every sprint ends with a demo of working software in a staging environment. CI/CD is set up in the first sprint.

## 5. Launch and handover

We run a launch checklist, monitor the release and hand over repositories, infrastructure code, runbooks and documentation. Optional support retainers cover maintenance and roadmap work.`,
  },
  {
    slug: "preparing-requirements",
    title: "Preparing project requirements",
    summary: "A checklist that makes discovery faster and estimates more accurate.",
    category: "Engagement",
    body: `You do not need a perfect specification. These items help most:

- **Goals:** the business outcomes and how you will measure them.
- **Users:** who they are, how many, and where they work (web, mobile, offline).
- **Core workflows:** the five to ten things users must be able to do.
- **Existing systems:** names, versions and whether APIs or database access are available.
- **Data:** volumes, sensitivity, retention rules and where it must be stored.
- **Compliance:** regulations or customer requirements that apply.
- **Constraints:** budget range, deadline drivers, preferred technology.
- **Samples:** screenshots, spreadsheets, forms or documents the new system will replace.`,
  },
  {
    slug: "architecture-principles",
    title: "Architecture principles",
    summary: "The defaults we apply unless your constraints suggest otherwise.",
    category: "Engineering",
    body: `## Keep it simple first

We prefer a well-structured modular monolith to premature microservices. Services are split out when scale or team boundaries demand it.

## Design for failure

Timeouts, retries with backoff, idempotent writes and graceful degradation are part of the first design, not an afterthought.

## Everything observable

Structured logs, metrics, traces and health checks ship with each service.

## Twelve-factor configuration

Configuration lives in the environment; secrets live in a secrets manager; builds are reproducible.

## Data integrity

Use transactions and constraints in the database to enforce invariants. Schema changes are versioned migrations that are tested.

## API-first

Public and internal interfaces are documented, versioned and contract-tested.`,
  },
  {
    slug: "security-practices",
    title: "Security and data-protection practices",
    summary: "The engineering controls we build into projects.",
    category: "Security",
    body: `These are engineering practices, not certifications. Certification status for Astareo is published on the Compliance section of the home page only when held.

## Application security

- Input validation on every boundary and output encoding by default.
- Authentication with hashed credentials, short-lived sessions and optional SSO/MFA.
- Authorisation checked server-side for every action.
- Dependency and secret scanning in CI.

## Data protection

- Encryption in transit (TLS) and at rest.
- Data minimisation: collect only what is needed, define retention.
- Separate environments; production data is not used in development.

## Operations

- Least-privilege access to cloud accounts and audit logging.
- Backups with tested restores.
- Incident response runbooks.
