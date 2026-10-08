import { createHash, randomBytes } from "node:crypto";

/** One-way hash so we can rate-limit and de-duplicate without storing raw IPs. */
export function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? "astareo"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export const newToken = (bytes = 24) => randomBytes(bytes).toString("base64url");
