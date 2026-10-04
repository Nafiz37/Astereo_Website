import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import "../globals.css";
import { JsonLd } from "@/components/ui/misc";
import { site } from "@/content/site";
import { isLocale, localeMeta, locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Inter has no Bengali glyphs; the browser falls back to this font per character.
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap" });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata(): Promise<Metadata> {
  const lang = await rootLang();
  if (!isLocale(lang)) return {};
  const d = dictionaries[lang];
  const prefix = lang === "bn" ? "/bn" : "";
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.siteTitle, template: `%s | ${lang === "bn" ? "আস্তারিও" : site.name}` },
    description: d.meta.siteDescription,
    applicationName: site.name,
    authors: [{ name: "Astareo Team" }],
    alternates: { canonical: prefix || "/", languages: { en: "/", bn: "/bn", "x-default": "/" } },
    openGraph: { title: d.meta.homeTitle, description: d.meta.siteDescription, url: prefix || "/", siteName: site.name, type: "website", locale: localeMeta[lang].ogLocale, alternateLocale: lang === "bn" ? "en_US" : "bn_BD" },
    twitter: { card: "summary_large_image", title: d.meta.homeTitle, description: d.meta.siteDescription },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#0a0f1e", colorScheme: "dark", width: "device-width", initialScale: 1 };

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  foundingDate: String(site.foundedYear),
  email: site.email,
  telephone: site.phone,
  sameAs: Object.values(site.social),
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: site.email, telephone: site.phone, availableLanguage: ["English", "Bengali"] }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await rootLang();
  if (!isLocale(lang)) notFound();
  const d = dictionaries[lang];
  return (
    <html lang={localeMeta[lang].htmlLang} className={`dark ${inter.variable} ${bengali.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
          {d.common.skip}
        </a>
        {children}
        <JsonLd data={organization} />
      </body>
    </html>
  );
}
