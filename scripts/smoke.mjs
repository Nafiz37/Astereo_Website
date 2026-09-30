/**
 * End-to-end smoke test for a RUNNING Astareo site (local or deployed).
 *
 *   npm run smoke                                   # against http://localhost:3000, reads .env.local
 *   BASE=https://your-app.vercel.app ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='...' npm run smoke
 *
 * Options: EMAIL_MODE=1 sends real emails to SMOKE_EMAIL_BASE (default: the SMTP user's inbox, via plus-addressing),
 *          WITH_AI=1 also exercises the live AI assistant (uses model quota).
 * WARNING: it creates real test leads/bookings (and cancels the bookings) in the target database.
 */
import { existsSync, readFileSync } from "node:fs";

const fileEnv = existsSync(".env.local")
  ? Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split("\n")
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
    )
  : {};
const env = { ...fileEnv, ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v)) };
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (plain text, for the smoke test only) in the environment or .env.local.");
  process.exit(2);
}
const B = process.env.BASE ?? "http://localhost:3000";
const EMAIL_MODE = process.env.EMAIL_MODE === "1"; // real emails: keep them few, all to the owner's inbox
const WITH_AI = process.env.WITH_AI === "1";
let pass = 0;
let fail = 0;
const t = (name, ok, extra = "") => {