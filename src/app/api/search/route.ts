import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { buildSearchIndex } from "@/lib/search-index";

export async function GET(req: Request) {
  const l = new URL(req.url).searchParams.get("lang");
  const lang = isLocale(l) ? l : "en";
  return NextResponse.json(buildSearchIndex(lang), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
