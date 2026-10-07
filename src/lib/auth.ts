import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "astareo_admin";
const MAX_AGE_SEC = 60 * 60 * 8;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  return new TextEncoder().encode("dev-only-insecure-secret-change-me-0123456789");
}

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
};

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD));
}

/** Verifies credentials in constant time. Prefers a bcrypt hash; plain ADMIN_PASSWORD is allowed for first run only. */
export async function verifyAdmin(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const hash = (process.env.ADMIN_PASSWORD_HASH ?? "").replace(/\\\$/g, "$");
  const plain = process.env.ADMIN_PASSWORD ?? "";
  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  let passOk = false;
  if (hash) passOk = await bcrypt.compare(password, hash);
  else if (plain) passOk = safeEqual(password, plain);
  else await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi"); // equalise timing
  return emailOk && passOk;
}

export async function createSession(email: string) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || !payload.sub) return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

/** For server components / pages: redirects to the login screen when unauthenticated. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
