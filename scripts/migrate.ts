/**
 * Applies SQL migrations in ./drizzle to the database in DATABASE_URL.
 * Runs automatically before `next build` (see package.json). Safe to run repeatedly.
 * Without DATABASE_URL it is skipped (local dev uses embedded PGlite and migrates itself).
 */
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[migrate] DATABASE_URL not set - skipping migrations.");
    return;
  }
  const client = postgres(url, { max: 1, prepare: false, connect_timeout: 30 });
  try {
    await migrate(drizzle(client), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("[migrate] Migrations applied.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
