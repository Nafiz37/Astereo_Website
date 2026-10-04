import { Mail, Phone } from "lucide-react";
import Link from "@/components/ui/link";
import { Logo } from "@/components/ui/logo";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/ui/social-icons";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { site } from "@/content/site";
import { toBanglaDigits } from "@/i18n/config";
import { industriesFor, solutionsFor } from "@/i18n/localize";
import { getDict, getLang } from "@/i18n/server";

type L = { label: string; href: string };

function Column({ title, links }: { title: string; links: L[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function Footer() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const nav = (hrefs: string[]): L[] => hrefs.map((h) => ({ href: h, label: d.nav.items[h].label }));
  const year = new Date().getFullYear();
  const years = lang === "bn" ? `${toBanglaDigits(site.foundedYear)}–${toBanglaDigits(year)}` : `${site.foundedYear}–${year}`;

  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link href="/" aria-label={d.nav.homeAria}>
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {d.hero.strap}. {d.footer.blurb}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" /> {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary" dir="ltr">
                  <Phone className="h-4 w-4" /> {site.phoneDisplay}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              {[
                { href: site.social.linkedin, label: "LinkedIn", icon: <LinkedinIcon /> },
                { href: site.social.facebook, label: "Facebook", icon: <FacebookIcon /> },
                { href: site.social.twitter, label: "X (Twitter)", icon: <XIcon /> },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Astareo — ${s.label}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <Column title={d.footer.solutions} links={solutionsFor(lang).map((s) => ({ label: s.navName, href: `/solutions/${s.slug}` }))} />
          <Column title={d.footer.industries} links={industriesFor(lang).slice(0, 9).map((i) => ({ label: i.navName ?? i.name, href: `/industries/${i.slug}` }))} />
          <Column title={d.footer.resources} links={nav(["/case-studies", "/resources/documentation", "/blog", "/resources/whitepapers", "/resources/api-reference", "/resources/changelog"])} />
          <Column title={d.footer.company} links={[...nav(["/about", "/careers", "/contact", "/partners", "/press"]), { label: d.nav.pricing, href: "/pricing" }]} />
        </div>

        <div className="mt-12 grid gap-6 rounded-2xl border border-border/60 bg-secondary/40 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="font-semibold">{d.footer.newsletterTitle}</h3>
            <p className="text-sm text-muted-foreground">{d.footer.newsletterDesc}</p>
          </div>
          <div className="md:w-96">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            © {years} {site.legalName} {d.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary">
              {d.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-primary">
              {d.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
