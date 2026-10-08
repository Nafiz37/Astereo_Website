import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Date `days` ago (negative = future). Kept outside components so server pages stay render-pure. */
export const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

export const formatDate = (iso: string, lang: "en" | "bn" = "en") =>
  new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
