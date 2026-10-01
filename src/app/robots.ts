import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/get-started/cancel", "/get-started/manage", "/bn/get-started/cancel", "/bn/get-started/manage"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
