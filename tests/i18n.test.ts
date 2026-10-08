import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { industries } from "@/content/industries";
import { solutions } from "@/content/solutions";
import { budgets, services, timelines } from "@/content/site";
import { bn } from "@/i18n/bn";
import { localizeHref, stripLocale, toBanglaDigits } from "@/i18n/config";
import { en } from "@/i18n/en";
import { translateError } from "@/i18n/errors";
import { caseStudiesFor, industriesFor, solutionsFor } from "@/i18n/localize";
import { proxy } from "@/proxy";
import { buildNav } from "@/lib/nav";
import { buildSearchIndex } from "@/lib/search-index";
import { flattenZodError, leadSchema } from "@/lib/validation";
import { handleChat, type ChatEvent } from "@/lib/agent/chat";

/** Walks two values in parallel and reports structural differences (missing keys, array length, type). */
function diffShape(a: unknown, b: unknown, path = ""): string[] {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return [`${path}: expected array`];
    const out = a.length === b.length ? [] : [`${path}: array length ${a.length} vs ${b.length}`];
    a.forEach((v, i) => b[i] !== undefined && out.push(...diffShape(v, b[i], `${path}[${i}]`)));
    return out;
  }
  if (a && typeof a === "object") {
    if (!b || typeof b !== "object") return [`${path}: expected object`];
    const out: string[] = [];
    for (const k of Object.keys(a)) {
      if (!(k in b)) out.push(`${path}.${k}: missing`);
      else out.push(...diffShape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`));
    }
    return out;
  }
  return typeof a === typeof b ? [] : [`${path}: type ${typeof a} vs ${typeof b}`];
}

function strings(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => strings(x, `${path}.${k}`));
  return [];
}

describe("dictionaries", () => {
  it("Bangla has exactly the same structure as English (keys and array lengths)", () => {
    expect(diffShape(en, bn)).toEqual([]);
  });

  it("has no empty Bangla strings (except intentionally blank prefixes) and keeps template placeholders", () => {
    const empty = strings(bn).filter(([p, s]) => s === "" && !p.endsWith("descPrefix"));
    expect(empty).toEqual([]);
    for (const key of ["solutionTitle", "industryTitle"] as const) {
      expect(bn.pageCta[key]).toContain("{name}");
      expect(en.pageCta[key]).toContain("{name}");
    }
  });

  it("translates every select option that the forms submit", () => {
    for (const s of services) expect(bn.options.services[s], s).toBeTruthy();
    for (const s of budgets) expect(bn.options.budgets[s], s).toBeTruthy();
    for (const s of timelines) expect(bn.options.timelines[s], s).toBeTruthy();
  });

  it("covers every nav item and search page with a Bangla label", () => {
    const nav = buildNav(bn, "bn");
    for (const g of nav) {
      expect(g.label).toMatch(/[ঀ-৿]/);
      for (const it of g.items ?? []) expect(it.label, it.href).toMatch(/[ঀ-৿]/);
    }
    expect(Object.keys(bn.search.pages)).toEqual(Object.keys(en.search.pages));
  });
});

describe("content overlays", () => {
  it("translates every solution, with matching array lengths and untouched slugs/images", () => {
    const bnList = solutionsFor("bn");
    expect(bnList).toHaveLength(solutions.length);
    solutions.forEach((s, i) => {
      const t = bnList[i];
      expect(t.slug).toBe(s.slug);
      expect(t.image).toBe(s.image);
      expect(t.name, s.slug).toMatch(/[ঀ-৿]/);
      expect(t.overview, s.slug).toMatch(/[ঀ-৿]/);
      expect(t.features).toHaveLength(s.features.length);
      expect(t.useCases).toHaveLength(s.useCases.length);
      expect(t.deliverables).toHaveLength(s.deliverables.length);
      expect(t.faqs).toHaveLength(s.faqs.length);
      expect(t.badges).toHaveLength(s.badges.length);
      t.features.forEach((f) => expect(f.title + f.desc).toMatch(/[ঀ-৿]/));
    });
  });

  it("translates every industry including per-offering text", () => {
    industriesFor("bn").forEach((t, i) => {
      const s = industries[i];
      expect(t.slug).toBe(s.slug);
      expect(t.name, s.slug).toMatch(/[ঀ-৿]/);
      expect(t.challenges).toHaveLength(s.challenges.length);
      expect(t.offerings).toHaveLength(s.offerings.length);
      t.offerings.forEach((o, n) => {
        expect(o.solution).toBe(s.offerings[n].solution);
        expect(o.how, `${s.slug}#${n}`).toMatch(/[ঀ-৿]/);
      });
    });
  });

  it("translates every case study and keeps metric values intact", () => {
    caseStudiesFor("bn").forEach((t, i) => {
      const s = caseStudies[i];
      expect(t.slug).toBe(s.slug);
      expect(t.title, s.slug).toMatch(/[ঀ-৿]/);
      expect(t.approach).toHaveLength(s.approach.length);
      expect(t.deliverables).toHaveLength(s.deliverables.length);
      expect(t.metrics.map((m) => m.value)).toEqual(s.metrics.map((m) => m.value));
      t.metrics.forEach((m) => expect(m.label).toMatch(/[ঀ-৿]/));
      expect(t.verified).toBe(s.verified); // translation must never flip the honesty flag
    });
  });

  it("returns the original English objects for the default locale", () => {
    expect(solutionsFor("en")[0]).toBe(solutions[0]);
  });

  it("builds a Bangla search index", () => {
    const idx = buildSearchIndex("bn");
    expect(idx.find((i) => i.href === "/solutions/lms")?.title).toMatch(/[ঀ-৿]/);
    expect(idx.find((i) => i.href === "/pricing")?.title).toMatch(/[ঀ-৿]/);
    expect(buildSearchIndex("en").find((i) => i.href === "/pricing")?.title).toBe("Pricing & engagement models");
  });
});

describe("locale routing helpers", () => {
  it("prefixes Bangla paths and leaves English, API, admin, assets and external links alone", () => {
    expect(localizeHref("/pricing", "bn")).toBe("/bn/pricing");
    expect(localizeHref("/", "bn")).toBe("/bn");
    expect(localizeHref("/pricing?x=1#a", "bn")).toBe("/bn/pricing?x=1#a");
    expect(localizeHref("/bn/pricing", "bn")).toBe("/bn/pricing");
    expect(localizeHref("/pricing", "en")).toBe("/pricing");
    for (const h of ["/api/leads", "/admin/leads", "/icon.svg", "/sitemap.xml", "https://example.com", "mailto:a@b.co", "#top", "//cdn.example.com/x"]) expect(localizeHref(h, "bn")).toBe(h);
  });

  it("strips the locale prefix", () => {
    expect(stripLocale("/bn/pricing")).toBe("/pricing");
    expect(stripLocale("/bn")).toBe("/");
    expect(stripLocale("/pricing")).toBe("/pricing");
    expect(stripLocale("/bnx/pricing")).toBe("/bnx/pricing");
  });

  it("converts digits to Bangla numerals", () => {
    expect(toBanglaDigits("2026")).toBe("২০২৬");
    expect(toBanglaDigits("3x")).toBe("৩x");
  });
});

describe("proxy", () => {
  const run = (path: string) => proxy(new NextRequest(`http://localhost:3000${path}`));

  it("rewrites English URLs internally to /en/…", () => {
    const res = run("/pricing");
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/en/pricing");
    expect(run("/").headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/en");
  });

  it("passes /bn through untouched", () => {
    expect(run("/bn/pricing").headers.get("x-middleware-rewrite")).toBeNull();
    expect(run("/bn").headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("permanently redirects /en/… to the canonical unprefixed URL", () => {
    const res = run("/en/pricing");
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("http://localhost:3000/pricing");
    expect(run("/en").headers.get("location")).toBe("http://localhost:3000/");
  });
});

describe("Bangla server messages", () => {
  it("translates validation errors on request and falls back to English for unknown messages", () => {
    const r = leadSchema.safeParse({ type: "contact", name: "x", email: "bad", message: "short", consent: false });
    expect(r.success).toBe(false);
    if (!r.success) {
      const bnFields = flattenZodError(r.error, "bn");
      expect(bnFields.name).toMatch(/[ঀ-৿]/);
      expect(bnFields.email).toMatch(/[ঀ-৿]/);
      expect(bnFields.consent).toMatch(/[ঀ-৿]/);
      expect(flattenZodError(r.error, "en").name).toBe("Please enter your name");
    }
    expect(translateError("Something unknown", "bn")).toBe("Something unknown");
  });

  it("chat answers in Bangla when the AI is unavailable and the visitor is on the Bangla site", async () => {
    const saved = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const ev: ChatEvent[] = [];
    await handleChat({ message: "হ্যালো", lang: "bn", ipHash: "h", emit: (e) => ev.push(e) });
    const evEn: ChatEvent[] = [];
    await handleChat({ message: "hello", lang: "en", ipHash: "h", emit: (e) => evEn.push(e) });
    if (saved) process.env.GEMINI_API_KEY = saved;
    const text = (list: ChatEvent[]) => list.filter((e) => e.t === "text").map((e) => (e as { d: string }).d).join("");
    expect(text(ev)).toMatch(/[ঀ-৿]/);
    expect(text(evEn)).toMatch(/offline/i);
  });
});
