import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeader } from "@/components/ui/section";
import { Flag } from "@/components/ui/flag";
import { Reveal } from "@/components/ui/reveal";
import { industries } from "@/content/industries";
import { solutions } from "@/content/solutions";
import { markets, stats } from "@/content/site";
import { getDict, getLang } from "@/i18n/server";
import { Counter } from "./counter";

export async function GlobalReach() {
  const [d, lang] = await Promise.all([getDict(), getLang()]);
  // Unverified marketing numbers are replaced by facts we can stand behind (catalogue counts).
  const numbers = stats.verified
    ? stats.claimed.map((n, i) => ({ ...n, label: d.reach.claimed[i] ?? n.label }))
    : [
        { value: solutions.length, suffix: "", label: d.reach.solutionAreas, decimals: 0 },
        { value: industries.length, suffix: "", label: d.reach.industriesServed, decimals: 0 },
        { value: markets.length, suffix: "", label: d.reach.markets, decimals: 0 },
        { value: 1, suffix: d.reach.day, label: d.reach.responseTarget, decimals: 0 },
      ];

  return (
    <section className="section overflow-hidden" aria-labelledby="reach-title">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" aria-hidden="true" />
      <Container className="relative">
        <SectionHeader eyebrow={d.reach.eyebrow} title={<span id="reach-title">{d.reach.title}</span>} />

        <Reveal>
          <ul className="mb-10 flex flex-wrap items-center justify-center gap-3 md:gap-4" aria-label={d.reach.marketsLabel}>
            {markets.map((m, i) => (
              <li key={m.name} className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm">
                <Flag code={m.code} name={m.name} />
                <span className="font-medium uppercase tracking-wider text-foreground/80">{d.reach.marketNames[i] ?? m.name}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <div className="surface relative overflow-hidden p-6 md:p-10">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
              <defs>
                <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.4" fill="hsl(217 91% 60% / .5)" />
                </pattern>
                <radialGradient id="fade" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="black" />
                </radialGradient>
                <mask id="m">
                  <rect width="100%" height="100%" fill="url(#fade)" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" mask="url(#m)" />
            </svg>
            <div className="relative grid gap-8 md:grid-cols-4">
              {numbers.map((n) => (
                <div key={n.label} className="text-center">
                  <p className="gradient-text text-4xl font-bold md:text-5xl">
                    <Counter value={n.value} suffix={n.suffix} decimals={"decimals" in n ? n.decimals : 0} bangla={lang === "bn"} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{n.label}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-10 grid gap-4 border-t border-border/60 pt-8 sm:grid-cols-3 md:grid-cols-5">
              {d.reach.caps.map((c) => (
                <div key={c.t} className="text-center">
                  <p className="font-semibold">{c.t}</p>
                  <p className="text-xs text-muted-foreground">{c.s}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 text-center">
          <ButtonLink href="/about" variant="ghost">
            {d.reach.button}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
