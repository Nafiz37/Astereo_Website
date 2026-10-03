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
        <Container className="max-w-4xl" >
          <Breadcrumbs items={[{ label: d.nav.resources }, { label: d.pages.apiRef.title }]} />
          <EnglishOnlyNotice />
          <div className="surface mb-8 p-5 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Base URL:</strong> <code className="rounded bg-muted px-1.5 py-0.5">{site.url}</code></p>
            <p className="mt-2"><strong className="text-foreground">Rate limits:</strong> write endpoints are limited per IP address and return <code className="rounded bg-muted px-1.5 py-0.5">429</code> with a <code className="rounded bg-muted px-1.5 py-0.5">Retry-After</code> header. Validation failures return <code className="rounded bg-muted px-1.5 py-0.5">422</code> with a <code className="rounded bg-muted px-1.5 py-0.5">fields</code> object.</p>
          </div>
          <div className="space-y-8">
            {endpoints.map((e) => (
              <article key={e.path} className="surface overflow-hidden">
                <header className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-secondary/40 px-5 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${e.method === "GET" ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>{e.method}</span>
                  <code className="font-mono text-sm">{e.path}</code>
                </header>
                <div className="space-y-4 p-5">
                  <p className="text-sm text-foreground/85">{e.desc}</p>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request</p>
                    <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs"><code>{e.request}</code></pre>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response</p>
                    <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs"><code>{e.response}</code></pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
