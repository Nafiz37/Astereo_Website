import { CalendarCheck, Clock, Mail, Phone } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import Link from "@/components/ui/link";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { Container, PageHero } from "@/components/ui/section";
import { business, site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.contact.metaTitle, description: d.pages.contact.metaDesc, path: "/contact" }));

export default async function ContactPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.contact;
  const n = (v: number) => (lang === "bn" ? toBanglaDigits(v) : String(v));
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/contact"].label }]} />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <aside className="space-y-4">
              <a href={`mailto:${site.email}`} className="surface surface-hover flex items-center gap-4 p-5">
                <Mail className="h-6 w-6 text-primary" />
                <span><span className="block text-xs text-muted-foreground">{p.email}</span><span className="font-medium">{site.email}</span></span>
              </a>
              <a href={`tel:${site.phone}`} className="surface surface-hover flex items-center gap-4 p-5">
                <Phone className="h-6 w-6 text-primary" />
                <span><span className="block text-xs text-muted-foreground">{p.phone}</span><span className="font-medium" dir="ltr">{site.phoneDisplay}</span></span>
              </a>
              <div className="surface flex items-center gap-4 p-5">
                <Clock className="h-6 w-6 text-primary" />
                <span><span className="block text-xs text-muted-foreground">{p.hours}</span><span className="font-medium">{p.hoursValue}, {n(business.startHour)}:00–{n(business.endHour)}:00 ({business.timezone})</span></span>
              </div>
              <Link href="/get-started" className="surface surface-hover flex items-center gap-4 border-primary/40 bg-primary/5 p-5">
                <CalendarCheck className="h-6 w-6 text-primary" />
                <span><span className="block font-medium">{p.preferCall}</span><span className="text-sm text-muted-foreground">{p.preferCallBody}</span></span>
              </Link>
            </aside>
            <LeadForm type="sales" show={{ phone: true, company: true, service: true, budget: true, timeline: true }} submitLabel={p.submit} />
          </div>
        </Container>
      </section>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Astareo", url: `${site.url}/contact` }} />
    </>
  );
}
