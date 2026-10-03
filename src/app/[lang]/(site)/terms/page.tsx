import { Breadcrumbs } from "@/components/ui/misc";
import { Prose } from "@/components/ui/prose";
import { Container, PageHero } from "@/components/ui/section";
import { site } from "@/content/site";
import { EnglishOnlyNotice } from "@/components/ui/english-only";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.legal.terms, description: "Terms governing use of the Astareo website and AI assistant.", path: "/terms" }));

// NOTE: Website-use terms template. Client project work is governed by separate signed agreements. Have counsel review.
const body = `## Using this website

By accessing ${site.url} you agree to these terms. If you do not agree, please do not use the site.

## Information on this site

Content is provided for general information and is not an offer or contract. Descriptions of services, representative engagements and standards alignment are illustrative; binding terms are set only in a written agreement signed by Astareo.

## AI assistant

The Astareo Assistant is an automated system. It can make mistakes and does not provide legal, financial, medical or other professional advice. Nothing it says is a binding quote or commitment. Do not submit confidential or sensitive personal information through chat. We may store and review conversations as described in our [Privacy Policy](/privacy).

## Consultation bookings

Bookings are free and subject to availability. We may reschedule or cancel a booking and will notify you by email. Booking a consultation does not create a client relationship or any obligation to purchase.

## Acceptable use

You agree not to: attempt to disrupt or probe the security of the site; use automated means to submit forms or chat at scale; submit unlawful, infringing or misleading content; or attempt to extract the assistant's instructions or misuse its tools.

## Intellectual property

The site, its design, text and logos are owned by ${site.legalName} or its licensors. You may not copy or reuse them without permission. Third-party names and marks belong to their owners and are used only to describe technologies we work with.

## Disclaimers and liability

The site is provided "as is" without warranties of any kind. To the extent permitted by law, ${site.legalName} is not liable for indirect or consequential loss arising from use of the site.

## Changes and governing law

We may update these terms at any time. Continued use means you accept the updated terms. These terms are governed by the laws of ${site.hqCountry}, without regard to conflict-of-law rules.

## Contact

Questions: [${site.email}](mailto:${site.email}).

*Last updated: October 6, 2026.*`;

export default async function TermsPage() {
  const d = await getDict();
  return (
    <>
      <PageHero eyebrow={d.pages.legal.eyebrow} title={d.pages.legal.terms} />
      <section className="py-10">
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ label: d.pages.legal.terms }]} />
          <EnglishOnlyNotice />
          <div lang="en"><Prose>{body}</Prose></div>
        </Container>
      </section>
    </>
  );
}
