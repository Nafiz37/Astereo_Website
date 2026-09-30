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
   `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `GEMINI_API_KEY`, `SMTP_*` (or `RESEND_API_KEY`), `EMAIL_FROM`, `NOTIFY_EMAIL`.
   The build command (`npm run build`) applies database migrations automatically.
6. **Domain:** *Settings → Domains →* add `astareo.tech` and `www.astareo.tech`; point DNS as Vercel instructs (if the domain is on Cloudflare, use DNS-only/grey cloud records or follow Vercel's Cloudflare guide).
7. **Verify:** open `https://astareo.tech/api/health` → `{"ok":true,"database":true,"ai":true,"email":true,"admin":true}`. Sign in at `/admin`, book a test consultation, chat with the assistant.
8. Submit `https://astareo.tech/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

> Keep the old site live until you've verified the new one; then switch DNS.

## Languages

- **Routing:** `src/proxy.ts` serves English at unprefixed URLs (internally `/en/…`) and Bangla at `/bn/…`; `/en/…` redirects (308) to the canonical unprefixed URL. All pages live under `src/app/[lang]/`.
- **UI text:** `src/i18n/en.ts` (source of truth and type) and `src/i18n/bn.ts`. TypeScript forces Bangla to keep the same shape; `tests/i18n.test.ts` also checks array lengths, placeholders and that every select option is translated.
- **Catalogue content:** Bangla overlays for solutions, industries and case studies in `src/i18n/*.bn.ts` (merged over the English data; English is the fallback).
- **English-only for now:** blog posts, documentation, whitepapers, API reference, changelog, privacy and terms. These show a small notice on Bangla pages. Legal text should be translated by a qualified person.
- **Please have a native speaker review the Bangla copy** (it was drafted by AI) before launch.
- To add a language: add it to `locales` in `src/i18n/config.ts`, create a dictionary and overlays, register them in `src/i18n/dictionaries.ts`/`localize.ts`, and add its font if needed.

## Editing content

All copy lives in `src/content/` (plain TypeScript, no CMS needed):

- `site.ts` — company facts, contact details, hours, claims flags, stats, tech stack, process
- `solutions.ts`, `industries.ts`, `case-studies.ts` — catalogue pages
- `posts.ts` (blog), `docs.ts`, `whitepapers.ts`, `company.ts` (pricing models, careers roles, partners, changelog)

Edit → commit → Vercel redeploys. To add an open job, add an item to `openRoles` in `company.ts`.

## Architecture

```
src/app/(site)/…        public pages (static where possible)
src/app/admin/…         admin console (server-rendered, cookie-session guarded)
src/app/api/…           route handlers: leads, newsletter, consultation/*, chat (NDJSON stream), search, health, admin/*
src/lib/agent/          core.ts (model-agnostic tool loop) · tools.ts · prompt.ts · gemini.ts · chat.ts (persistence)
src/lib/                scheduling, bookings, leads, email, rate-limit (Postgres), auth (JWT cookie), validation (zod)
src/db/                 Drizzle schema + driver selection (Postgres in prod, PGlite locally)
drizzle/                generated SQL migrations
tests/                  vitest suites
```

Design decisions worth knowing:

- **Rate limiting in Postgres** so it works across serverless instances without Redis.
- **Agent core is provider-agnostic** (`ModelFn`), so swapping Gemini for another provider means writing one adapter.
- **Bookings are race-safe at the database level**, not just in application code.
- **Email is best-effort**: if Resend is down or unset, forms/bookings still succeed and are visible in `/admin`.

## Security notes

- Admin password is bcrypt-hashed, sessions are signed httpOnly cookies (8 h), login is rate-limited, all admin APIs re-check the session.
- Public POST endpoints: same-origin check, size limits, zod validation, honeypot, per-IP throttling; IPs are stored only as salted hashes.
- Security headers (HSTS, `nosniff`, frame and referrer policy) are set in `next.config.ts`. Consider adding a CSP once you add third-party scripts.
- AI: user text is treated as data; tools validate inputs server-side; bookings require an explicit confirmation flag; tool loops and daily volume are capped.

## Before launch checklist

- [ ] Have a lawyer review `/privacy` and `/terms` (templates reflecting what the site actually does).
- [ ] Confirm business hours/timezone in `business` (`src/content/site.ts`) and add holidays to `closedDates`.
- [ ] Decide which claims are provable and set their `verified` flags (see above).
- [ ] Replace stock photos if you have real ones (all images are Unsplash URLs).
- [ ] Add real case studies with client approval.
- [ ] Set up Resend domain verification so emails don't land in spam.

## Known limitations

- Long-form pages (blog, docs, whitepapers, legal) are English-only; everything else is bilingual.
- Emails (confirmations, notifications) are sent in English.
- Newsletter sign-ups are collected and exportable, but sending newsletters is not built (use Resend Broadcasts or export the CSV).
- Career applications take a link to a CV/profile rather than file uploads (keeps the stack free and avoids storing resumes).
