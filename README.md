# Astareo website

Full-stack rebuild of [astareo.tech](https://astareo.tech): marketing site, consultation booking, lead capture, an AI agent (Gemini, free tier) and an admin console, on a free-to-run stack.

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS | free |
| Hosting | Vercel (Hobby) | free |
| Database | PostgreSQL via Drizzle ORM — Neon or Supabase free tier (embedded PGlite for local dev) | free |
| AI agent | Google Gemini API (free tier) with function calling | free |
| Email | SMTP (e.g. Gmail app password, ~500/day) or Resend (100/day) | free |
| CI | GitHub Actions | free |

## What's included

- **Public site** — home (all original sections), 8 solution pages, 10 industry pages, case studies, blog, documentation, whitepapers, API reference, changelog, pricing, about, careers, contact, partners, press, privacy, terms, search (Ctrl+K), SEO (metadata, sitemap, robots, JSON-LD, OG image) and security headers.
- **Consultation booking** — live availability (Sun–Thu 10:00–18:00 Asia/Dhaka by default), visitor-timezone display, race-safe double-booking prevention (partial unique index), `.ics` invites, cancel link.
- **Lead capture** — contact/sales, partner and career forms with validation, honeypot, per-IP rate limits, lead scoring and email notifications.
- **AI agent ("Astareo Assistant")** — streaming chat widget backed by a tool-using Gemini agent: looks up services/industries/case studies, checks availability, books consultations (only after explicit confirmation), saves qualified leads, escalates to a human. Conversations are stored for review. Guardrails: input limits, loop limit, daily budget, no pricing/certification claims.
- **Admin console** (`/admin`) — system status with a **Send test email** button, leads (status, notes, search, CSV export), consultations, AI chat transcripts, newsletter subscribers.
- **English + Bangla (বাংলা)** — English at `/`, Bangla at `/bn`. Language switcher in the header, `hreflang`/canonical tags, bilingual sitemap, Bangla chat agent, validation errors and booking dates/digits in Bangla. See *Languages* below.

## Honest-claims system (important)

The old site claimed awards (Forbes, Deloitte, Inc. 5000…), named big-tech "clients", ISO/SOC 2/HIPAA badges, client counts, uptime and case-study results. None of that is verifiable from the codebase, so by default the new site renders **truthful alternatives**:

| Claim | Default rendering | To enable the original claim |
|---|---|---|
| Awards strip | Capability chips | `awards.verified = true` in `src/content/site.ts` |
| "Trusted by" logos | "Platforms we build on & integrate with" | `ecosystem.clientsVerified = true` |
| 500+ clients / 99.9% uptime / 200+ engineers / 25+ countries | Catalogue facts (solution areas, industries, markets, response target) | `stats.verified = true` and edit numbers |
| Compliance badges | "Aligned" (not certified) | set `certified: true` per standard **only with a real certificate** |
| Case-study metrics | Hidden; labelled "Representative engagement" | `verified: true` per case study in `src/content/case-studies.ts` (with client permission) |

Flip a flag only when you can prove the claim. Misstated certifications and results create real legal exposure.

## Local development

```bash
npm install
cp .env.example .env.local      # then edit; for local dev only ADMIN_*, SESSION_SECRET are needed
npm run dev                     # http://localhost:3000  (embedded database in ./.data)
```

Useful scripts:

```bash
npm test               # unit + integration tests (embedded Postgres, scripted AI model)
npm run lint && npm run typecheck
npm run ai:check       # verifies your Gemini key and function calling
npm run admin:hash -- "a long unique password"   # prints ADMIN_PASSWORD_HASH
npm run db:generate    # after editing src/db/schema.ts, creates a SQL migration in ./drizzle
npm run db:migrate     # applies migrations to DATABASE_URL (also runs automatically in `npm run build`)
```

## Deploy (Vercel + Neon, ~15 minutes)

1. **Push to GitHub** (`git init`, commit, push).
2. **Database:** create a free project at [neon.tech](https://neon.tech) (or Supabase). Copy the *pooled* connection string.
3. **Gemini key:** create a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
4. **Email (strongly recommended - without it nobody receives booking confirmations):** the quickest free option is SMTP with a Gmail *App Password* (Google Account → Security → 2-Step Verification → App passwords). Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `NOTIFY_EMAIL`. Alternatively use [Resend](https://resend.com), but it only delivers to arbitrary visitors after you verify a domain. After deploying, press **Send test email** on the `/admin` overview.
5. **Vercel:** *Add New → Project →* import the repo. Under *Environment Variables* add everything from `.env.example`: