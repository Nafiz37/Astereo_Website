import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { PGLITE_DIR: "memory://", NODE_ENV: "test", SESSION_SECRET: "test-secret-test-secret-test-secret-123456" },
    // Several files spin up an embedded Postgres (WASM). Running them in parallel can crash a worker on small machines.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
