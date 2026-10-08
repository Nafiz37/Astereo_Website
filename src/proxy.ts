import { NextResponse, type NextRequest } from "next/server";

/**
 * Locale routing:
 *   /pricing      -> English (internally rewritten to /en/pricing)
 *   /bn/pricing   -> Bangla
 *   /en/pricing   -> permanently redirected to /pricing (one canonical URL per page)
 * API routes, the admin console and static/metadata files are excluded by the matcher.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/bn" || pathname.startsWith("/bn/")) return NextResponse.next();

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice(3);
    return NextResponse.redirect(url, 308);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|icon\\.svg|robots\\.txt|sitemap\\.xml|opengraph-image|.*\\.[a-zA-Z0-9]+$).*)"],
};
