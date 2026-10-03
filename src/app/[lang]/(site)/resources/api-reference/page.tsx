import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { site } from "@/content/site";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.apiRef.metaTitle, description: "Public HTTP endpoints of the Astareo website: consultation availability and booking, lead capture, newsletter and the AI assistant.", path: "/resources/api-reference" }));

const endpoints = [
  {
    method: "GET",
    path: "/api/consultation/slots",
    desc: "Open 30-minute consultation slots for the next 30 days (UTC ISO timestamps).",
    request: `curl ${site.url}/api/consultation/slots`,
    response: `{ "ok": true, "timezone": "Asia/Dhaka", "slotMinutes": 30,\n  "slots": ["2026-10-11T04:00:00.000Z", "..."] }`,
  },
  {
    method: "POST",
    path: "/api/consultation/book",
    desc: "Book a slot returned by the slots endpoint. Returns 409 if the slot was just taken.",
    request: `curl -X POST ${site.url}/api/consultation/book \\\n  -H "Content-Type: application/json" \\\n  -d '{"startsAt":"2026-10-11T04:00:00.000Z","name":"Jane Doe","email":"jane@example.com","topic":"AI Agent Integration","consent":true}'`,
    response: `{ "ok": true, "booking": { "id": "…", "startsAt": "2026-10-11T04:00:00.000Z", "durationMin": 30 } }`,
  },
  {
    method: "POST",
    path: "/api/leads",
    desc: "Submit a contact, sales, partner or career enquiry. Rate limited to 5 requests per 10 minutes per IP.",
    request: `curl -X POST ${site.url}/api/leads \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"contact","name":"Jane Doe","email":"jane@example.com","message":"We need an LMS for 5,000 learners.","consent":true}'`,
    response: `{ "ok": true, "id": "…" }`,
  },
  {
    method: "POST",
    path: "/api/newsletter",
    desc: "Subscribe an email address to the newsletter.",
    request: `curl -X POST ${site.url}/api/newsletter -H "Content-Type: application/json" -d '{"email":"jane@example.com"}'`,
    response: `{ "ok": true }`,
  },
  {
    method: "POST",
    path: "/api/chat",
    desc: "Talk to the Astareo Assistant. Streams newline-delimited JSON events (session, text, tool, done).",
    request: `curl -N -X POST ${site.url}/api/chat -H "Content-Type: application/json" -d '{"message":"What do you build?"}'`,
    response: `{"t":"session","id":"…"}\n{"t":"text","d":"We build custom software, "}\n{"t":"done"}`,
  },
  {
    method: "GET",
    path: "/api/health",
    desc: "Service health: database connectivity and whether AI and email integrations are configured.",
    request: `curl ${site.url}/api/health`,
    response: `{ "ok": true, "database": true, "ai": true, "email": true, "admin": true }`,
  },
] as const;

export default async function ApiReferencePage() {
  const d = await getDict();
  return (
    <>
      <PageHero eyebrow={d.nav.resources} title={d.pages.apiRef.title} description={d.pages.apiRef.desc} />
      <section className="section pt-12">