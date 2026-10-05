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