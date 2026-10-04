"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { isLocale, localizeHref, defaultLocale } from "@/i18n/config";

/** Drop-in replacement for next/link that keeps visitors inside their language (/bn/...). */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { lang } = useParams<{ lang?: string }>();
  const locale = isLocale(lang) ? lang : defaultLocale;
  return <NextLink href={typeof href === "string" ? localizeHref(href, locale) : href} {...props} />;
}
