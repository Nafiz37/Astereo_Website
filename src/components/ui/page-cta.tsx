import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getDict } from "@/i18n/server";

type Props = { title?: string; body?: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string } };

export async function PageCta({ title, body, primary, secondary }: Props) {
  const d = await getDict();
  const p = primary ?? { label: d.pageCta.primary, href: "/get-started" };
  const s = secondary ?? { label: d.pageCta.secondary, href: "/contact" };
  return (
    <section className="section pt-0">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-brand-purple/20 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">{title ?? d.pageCta.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{body ?? d.pageCta.body}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href={p.href} size="lg">{p.label}</ButtonLink>
            <ButtonLink href={s.href} variant="ghost" size="lg">{s.label}</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
