import { bn } from "./bn";
import type { Locale } from "./config";
import { en, type Dict } from "./en";

/** All dictionaries. Safe to import from anywhere (route handlers, tests, server components). */
export const dictionaries: Record<Locale, Dict> = { en, bn };
