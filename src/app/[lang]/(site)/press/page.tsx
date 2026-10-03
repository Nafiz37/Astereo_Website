import { Download, Mail } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/misc";
import { LogoMark } from "@/components/ui/logo";
import { Container, PageHero } from "@/components/ui/section";
import { pressFacts } from "@/content/company";
import { site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { pageMeta } from "@/lib/seo";

export const generateMetadata = pageMeta((d) => ({ title: d.pages.press.metaTitle, description: d.pages.press.metaDesc, path: "/press" }));

export default async function PressPage() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.press;
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} description={p.desc} />
      <section className="section pt-12">
        <Container className="max-w-4xl">
          <Breadcrumbs items={[{ label: d.nav.items["/press"].label }]} />
          <div className="space-y-8">
            <div className="surface p-7">
              <h2 className="text-lg font-semibold">{p.about}</h2>
              <p className="mt-3 text-sm leading-7 text-foreground/85">{lang === "bn" ? p.boilerplate : pressFacts.boilerplate}</p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                [p.legalName, site.legalName],
                [p.founded, lang === "bn" ? toBanglaDigits(site.foundedYear) : String(site.foundedYear)],
                [p.hq, lang === "bn" ? "বাংলাদেশ" : site.hqCountry],
              ].map(([k, v]) => (
                <div key={k} className="surface p-5"><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1 font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div className="surface flex flex-wrap items-center gap-6 p-7">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary"><LogoMark className="h-14 w-14" /></div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{p.logo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{p.logoNote}</p>
              </div>
              <a href="/icon.svg" download="astareo-logo.svg" className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> {p.download}</a>
            </div>
            <div className="surface flex items-center gap-4 p-7">
              <Mail className="h-6 w-6 text-primary" />
              <p className="text-sm">{p.media}: <a className="text-primary underline" href={`mailto:${pressFacts.mediaEmail}`}>{pressFacts.mediaEmail}</a></p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
