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