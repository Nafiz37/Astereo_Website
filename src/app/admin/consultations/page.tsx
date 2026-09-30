import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { and, asc, count, desc, eq, gte, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { Download } from "lucide-react";
import { InlineSelect } from "@/components/admin/inline-select";
import { business } from "@/content/site";
import { getDb, tables } from "@/db";
import { BOOKING_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatInZone, zonedParts, zonedTimeToUtc } from "@/lib/scheduling";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultations" };
export const dynamic = "force-dynamic";

const VIEWS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
] as const;
type ViewId = (typeof VIEWS)[number]["id"];

/** [start, end) of the current day in the business timezone, as Dates. */
function businessDay(offsetDays = 0) {
  const p = zonedParts(Date.now(), business.timezone);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays));
  const start = zonedTimeToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), 0, 0, business.timezone);
  const nextDay = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays + 1));
  const end = zonedTimeToUtc(nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate(), 0, 0, business.timezone);
  return { start: new Date(start), end: new Date(end) };
}
