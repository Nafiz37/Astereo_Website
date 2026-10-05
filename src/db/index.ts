import { mkdirSync } from "node:fs";
import path from "node:path";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

type Cache = { db?: Promise<Db> };
const globalCache = globalThis as unknown as { __astareoDb?: Cache };
const cache: Cache = (globalCache.__astareoDb ??= {});

async function create(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const [{ drizzle }, { default: postgres }] = await Promise.all([import("drizzle-orm/postgres-js"), import("postgres")]);
    // `prepare: false` keeps this compatible with pooled/serverless Postgres (Neon, Supabase pooler).
    const client = postgres(url, { max: process.env.VERCEL ? 1 : 10, prepare: false, idle_timeout: 20, connect_timeout: 15 });
    return drizzle(client, { schema });
  }

  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_DB) {
    throw new Error("DATABASE_URL is not set. Add a Postgres connection string (e.g. from Neon or Supabase) to your environment.");
  }

  // Zero-config local development: an embedded Postgres (PGlite) stored in ./.data/pglite
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);
  const dataDir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  if (!dataDir.startsWith("memory://")) mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const local = drizzle(client, { schema });
  await migrate(local, { migrationsFolder: MIGRATIONS });
  return local as unknown as Db;
}

/** Returns the shared database handle (Postgres in production, embedded PGlite in local dev). */
export function getDb(): Promise<Db> {
  cache.db ??= create().catch((err) => {
    cache.db = undefined;
    throw err;
  });
  return cache.db;
}

export * as tables from "./schema";
