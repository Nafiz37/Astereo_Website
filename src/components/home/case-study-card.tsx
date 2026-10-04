import Image from "next/image";
import Link from "@/components/ui/link";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import { toBanglaDigits } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";

export async function CaseStudyCard({ cs, className = "" }: { cs: CaseStudy; className?: string }) {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  return (
    <article className={`surface surface-hover group relative flex h-full flex-col overflow-hidden ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={cs.image} alt={cs.title} fill sizes="(min-width: 1024px) 380px, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">{cs.verified ? d.stories.badgeVerified : d.stories.badgeExample}</span>
        <span className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-purple text-lg font-bold" aria-hidden="true">
          {cs.initial}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">{cs.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{cs.challenge}</p>
        <div className="mt-4 rounded-lg bg-secondary/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{d.stories.ourSolution}</p>
          <p className="mt-1 text-sm text-foreground/80">{cs.solutionSummary}</p>
        </div>
        {cs.verified && cs.metrics.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-4">
            {cs.metrics.map((m) => (
              <li key={m.label}>
                <p className="gradient-text text-2xl font-bold">{lang === "bn" ? toBanglaDigits(m.value) : m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/case-studies/${cs.slug}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary after:absolute after:inset-0">
          {d.stories.readFull} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
