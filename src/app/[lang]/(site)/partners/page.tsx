import { Handshake } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { partnerTracks } from "@/content/company";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.partners.metaTitle, description: d.pages.partners.metaDesc, path: "/partners" }));

export default async function PartnersPage() {
  const d = await getDict();
  const p = d.pages.partners;
  // Submitted values stay in English (what the team sees); labels are shown in the visitor's language.
  const labels = Object.fromEntries(partnerTracks.map((t, i) => [t.title, p.tracks[i]?.title ?? t.title]));
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/partners"].label }]} />
          <div className="grid gap-6 md:grid-cols-3">
            {p.tracks.map((t) => (
              <div key={t.title} className="surface p-7">
                <Handshake className="h-7 w-7 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
          <div id="apply" className="mx-auto mt-14 max-w-3xl">
            <h2 className="mb-6 text-2xl font-semibold">{p.becomeTitle}</h2>
            <LeadForm
              type="partner"
              show={{ company: true, phone: true, role: { label: p.trackLabel, options: partnerTracks.map((t) => t.title), labels }, link: { label: p.websiteLabel, hint: "https://…" } }}
              messageLabel={p.messageLabel}
              submitLabel={p.submit}
              successTitle={p.successTitle}
              successBody={p.successBody}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
