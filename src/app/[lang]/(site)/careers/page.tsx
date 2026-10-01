import { Sparkles } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { Breadcrumbs } from "@/components/ui/misc";
import { Container, PageHero, SectionHeader } from "@/components/ui/section";
import { openRoles } from "@/content/company";
import { getDict } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.careers.metaTitle, description: d.pages.careers.metaDesc, path: "/careers" }));

export default async function CareersPage() {
  const d = await getDict();
  const p = d.pages.careers;
  const roleOptions = [...openRoles.map((r) => r.title), "Open application"];
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container>
          <Breadcrumbs items={[{ label: d.nav.items["/careers"].label }]} />
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-semibold">{p.openRoles}</h2>
                {openRoles.length === 0 ? (
                  <p className="surface mt-4 flex gap-3 p-5 text-sm text-muted-foreground"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{p.noRoles}</p>
                ) : (
                  <ul className="mt-4 space-y-3" lang="en">
                    {openRoles.map((r) => (
                      <li key={r.slug} className="surface p-5">
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-xs text-muted-foreground">{r.team} · {r.location} · {r.type}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{p.areasTitle}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {p.areas.map((a) => <li key={a.title} className="surface p-4"><h3 className="font-semibold">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.desc}</p></li>)}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{p.whyTitle}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground/85 marker:text-primary">{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <div id="apply">
              <SectionHeader align="left" title={p.applyTitle} description={p.applyDesc} className="mb-6" />
              <LeadForm
                type="career"
                show={{
                  phone: true,
                  role: { label: p.roleLabel, options: roleOptions, labels: { "Open application": p.openApplication } },
                  link: { label: p.linkLabel, hint: p.linkHint, required: true },
                }}
                messageLabel={p.messageLabel}
                messagePlaceholder={p.messagePlaceholder}
                submitLabel={p.submit}
                successTitle={p.successTitle}
                successBody={p.successBody}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
