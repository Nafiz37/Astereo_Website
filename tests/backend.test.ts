import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { bookConsultation, cancelConsultation, listOpenSlots } from "@/lib/bookings";
import { rateLimit } from "@/lib/rate-limit";
import { handleChat, type ChatEvent } from "@/lib/agent/chat";
import { buildTools } from "@/lib/agent/tools";
import type { AgentContent, AgentPart, ModelFn } from "@/lib/agent/core";

const now = Date.parse("2026-10-06T12:00:00Z");
let slots: string[] = [];

beforeAll(async () => {
  await getDb(); // runs migrations on embedded Postgres (PGlite, in memory)
  slots = await listOpenSlots(now);
});

const person = (n: number) => ({ name: `Test User ${n}`, email: `user${n}@example.com`, topic: "ERP Solutions", notes: "We need an ERP" });

describe("consultation booking", () => {
  it("offers slots and books one", async () => {
    expect(slots.length).toBeGreaterThan(10);
    const r = await bookConsultation({ startsAt: slots[0], ...person(1) }, now);
    expect(r.ok).toBe(true);
    const after = await listOpenSlots(now);
    expect(after).not.toContain(slots[0]);