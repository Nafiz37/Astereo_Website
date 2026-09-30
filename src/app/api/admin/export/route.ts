import { desc } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { getAdmin } from "@/lib/auth";
import { fail } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";