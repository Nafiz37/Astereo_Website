import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("container", className)}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-12 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.6rem] lg:leading-tight">{title}</h2>
      {description && <p className="mt-4 text-base text-muted-foreground md:text-lg">{description}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-hero relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <Container className="relative">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-5 text-lg text-muted-foreground md:text-xl">{description}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
