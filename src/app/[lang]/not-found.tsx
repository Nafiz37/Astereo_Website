import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ButtonLink } from "@/components/ui/button";
import Link from "@/components/ui/link";
import { Container } from "@/components/ui/section";
import { getDict, getLang } from "@/i18n/server";
import { buildNav } from "@/lib/nav";

export default async function NotFound() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  const p = d.pages.notFound;
  return (
    <>
      <Header groups={buildNav(d, lang)} />
      <main id="main" className="bg-hero flex min-h-[80vh] items-center pt-24">
        <Container className="text-center">
          <p className="gradient-text text-7xl font-bold">{lang === "bn" ? "৪০৪" : "404"}</p>
          <h1 className="mt-4 text-3xl font-semibold">{p.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{p.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">{p.home}</ButtonLink>
            <ButtonLink href="/solutions" variant="ghost">{p.solutions}</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">{p.contact}</ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {p.or} <Link href="/get-started" className="text-primary underline">{p.book}</Link>.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
