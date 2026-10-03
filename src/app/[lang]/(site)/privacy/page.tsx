import { Breadcrumbs } from "@/components/ui/misc";
import { Prose } from "@/components/ui/prose";
import { Container, PageHero } from "@/components/ui/section";
import { site } from "@/content/site";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.legal.privacy, description: "How Astareo collects, uses and protects personal data on this website.", path: "/privacy" }));

// NOTE: Template reflecting what this website actually does. Have qualified counsel review it before relying on it.
const body = `## Who we are

${site.legalName} ("Astareo", "we") operates ${site.url}. Contact: [${site.email}](mailto:${site.email}).

## What we collect and why

- **Enquiry, sales, partner and career forms:** name, email, optional phone, company, message and related fields. We use these to respond to you, assess your request and, for applications, to consider you for roles.
- **Consultation bookings:** the details above plus your chosen time and timezone. We use them to run the meeting and send confirmations and reminders.
- **AI assistant conversations:** messages you type and the assistant's replies, plus the details you give it. They are stored to provide the service, follow up on requests and improve quality. Please don't share sensitive personal data in chat.
- **Newsletter:** your email address, until you unsubscribe.
- **Security and abuse prevention:** a one-way hash of your IP address and your browser's user-agent, used for rate limiting and fraud prevention. We do not store raw IP addresses.

## Cookies and local storage

We do not use advertising or tracking cookies. Our admin area uses a strictly necessary session cookie for staff only. The chat widget keeps your conversation in your browser's local storage so it persists between pages; clear it with "New chat" or by clearing site data.

## Who processes data for us

- Hosting and database providers (for example Vercel and a managed PostgreSQL provider) to run this website.
- An AI model provider (Google Gemini API) to generate assistant replies. Chat content is sent to the provider for this purpose.
- An email delivery provider (Resend) to send notifications and confirmations.

We do not sell personal data.

## Legal bases (GDPR)

Consent (newsletter, forms), legitimate interests (responding to enquiries, security) and, where relevant, steps taken at your request before entering a contract.

## Retention

Enquiries and conversations are kept as long as needed to handle your request and for up to 24 months afterwards unless a business relationship continues. Newsletter data is kept until you unsubscribe. Career applications are kept for up to 12 months.

## Your rights

Depending on where you live you may request access, correction, deletion, restriction, portability or objection, and may withdraw consent at any time. Email [${site.email}](mailto:${site.email}) and we will respond within 30 days. You can also complain to your local data-protection authority.

## International transfers

Our providers may process data outside your country. Where required, we rely on appropriate safeguards such as standard contractual clauses.

## Security

We use encryption in transit, access controls and least-privilege administration. No system is perfectly secure; please contact us if you suspect a problem.

## Changes

We may update this policy; the date below shows the latest revision.

*Last updated: October 6, 2026.*`;

export default async function PrivacyPage() {
  const d = await getDict();
  return (
    <>
      <PageHero eyebrow={d.pages.legal.eyebrow} title={d.pages.legal.privacy} />
      <section className="py-10">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: d.pages.legal.privacy }]} />
          <EnglishOnlyNotice />
          <div lang="en"><Prose>{body}</Prose></div>
        </Container>
      </section>
    </>
  );
}
