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
  });

  it("prevents double booking of the same slot", async () => {
    const r = await bookConsultation({ startsAt: slots[0], ...person(2) }, now);
    expect(r).toEqual({ ok: false, reason: expect.stringMatching(/slot_unavailable|slot_taken/) });
  });

  it("is race-safe: concurrent bookings of one slot yield exactly one success", async () => {
    const target = slots[5];
    const results = await Promise.all([10, 11, 12, 13, 14].map((n) => bookConsultation({ startsAt: target, ...person(n) }, now)));
    expect(results.filter((r) => r.ok).length).toBe(1);
  });

  it("rejects times that were never offered", async () => {
    const r = await bookConsultation({ startsAt: new Date(Date.parse(slots[1]) + 60_000).toISOString(), ...person(3) }, now);
    expect(r).toMatchObject({ ok: false, reason: "slot_unavailable" });
    const past = await bookConsultation({ startsAt: "2020-01-01T04:00:00.000Z", ...person(3) }, now);
    expect(past).toMatchObject({ ok: false, reason: "slot_unavailable" });
  });

  it("limits upcoming bookings per email", async () => {
    await bookConsultation({ startsAt: slots[2], ...person(4) }, now);
    await bookConsultation({ startsAt: slots[3], ...person(4) }, now);
    const third = await bookConsultation({ startsAt: slots[4], ...person(4) }, now);
    expect(third).toMatchObject({ ok: false, reason: "too_many_bookings" });
  });

  it("cancels with the correct token only and frees the slot", async () => {
    const r = await bookConsultation({ startsAt: slots[20], ...person(5) }, now);
    if (!r.ok) throw new Error("expected booking");
    expect(await cancelConsultation(r.booking.id, "wrong-token-wrong-token")).toBeNull();
    expect(await cancelConsultation(r.booking.id, r.booking.cancelToken)).not.toBeNull();
    expect(await listOpenSlots(now)).toContain(slots[20]);
  });
});

describe("rate limiter", () => {
  it("allows up to the limit then blocks with retry-after", async () => {
    const key = `test:${Math.random()}`;
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await rateLimit(key, 3, 60));
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false, false]);
    expect(results[4].retryAfterSec).toBeGreaterThan(0);
  });
});

describe("agent tools", () => {
  it("refuses to book without explicit user confirmation", async () => {
    const db = await getDb();
    const [s] = await db.insert(tables.chatSessions).values({}).returning();
    const tools = buildTools({ sessionId: s.id, timezone: "Europe/London" });
    const res = await tools.book_consultation({ name: "Ann Lee", email: "ann@example.com", startsAt: slots[30], user_confirmed: false });
    expect(res.error).toMatch(/confirm/i);
    expect(await tools.book_consultation({ name: "Ann Lee", email: "not-an-email", startsAt: slots[30], user_confirmed: true })).toHaveProperty("error");
  });

  it("returns slots in the visitor's timezone and company info without inventing certifications", async () => {
    const db = await getDb();
    const [s] = await db.insert(tables.chatSessions).values({}).returning();
    const tools = buildTools({ sessionId: s.id, timezone: "Europe/London" });
    const slotRes = (await tools.get_available_slots({ max: 4 })) as { slots: { startsAt: string; visitorLocal?: string }[] };
    expect(slotRes.slots.length).toBeGreaterThan(0);
    expect(slotRes.slots[0].visitorLocal).toBeTruthy();
    const info = JSON.stringify(await tools.get_company_info({}));
    expect(info).toContain("not certified");
    expect(info).not.toMatch(/"status":"certified"/);
  });

  it("saves a lead once per session and updates it afterwards", async () => {
    const db = await getDb();
    const [s] = await db.insert(tables.chatSessions).values({}).returning();
    const tools = buildTools({ sessionId: s.id });
    await tools.save_lead({ name: "Bob Ray", email: "bob@acme.io", company: "Acme", summary: "Needs an LMS for 2,000 learners", budget: "$15k – $50k", timeline: "1–3 months", service: "LMS Platforms" });
    await tools.save_lead({ name: "Bob Ray", email: "bob@acme.io", summary: "Updated: also wants SCORM" });
    const leads = await db.select().from(tables.leads).where(eq(tables.leads.email, "bob@acme.io"));
    expect(leads).toHaveLength(1);
    expect(leads[0].message).toContain("SCORM");
    expect(leads[0].type).toBe("chat");
    expect(leads[0].score).toBeGreaterThan(30);
  });
});

describe("chat orchestration (scripted model)", () => {
  /** A model that behaves like a well-behaved agent: fetch slots, then book the first one when confirmed. */
  const model: ModelFn = async function* (contents: AgentContent[]) {
    const last = contents[contents.length - 1];
    const text = last.parts.map((p) => p.text ?? "").join("");
    const resp = last.parts.find((p) => p.functionResponse)?.functionResponse;
    if (resp?.name === "get_available_slots") {
      const first = (resp.response as { slots: { startsAt: string }[] }).slots[0];
      yield { parts: [{ text: "Booking that now. " }] };
      yield { parts: [{ functionCall: { name: "book_consultation", args: { name: "Cara Diaz", email: "cara@example.com", startsAt: first.startsAt, user_confirmed: true } } } as AgentPart] };
    } else if (resp?.name === "book_consultation") {
      yield { parts: [{ text: "You're booked!" }] };
    } else if (/book/i.test(text)) {
      yield { parts: [{ functionCall: { name: "get_available_slots", args: { max: 3 } } }] };
    } else {
      yield { parts: [{ text: "Hello from Astareo." }] };
    }
  };

  it("runs a multi-step booking conversation and persists every turn", async () => {
    const events: ChatEvent[] = [];
    await handleChat({ message: "I'd like to book a call", ipHash: "h", emit: (e) => events.push(e), model });

    const sessionId = (events.find((e) => e.t === "session") as { id: string }).id;
    expect(events.filter((e) => e.t === "tool").map((e) => (e as { name: string }).name)).toEqual(["get_available_slots", "book_consultation"]);
    expect(events.at(-1)).toEqual({ t: "done" });
    const text = events.filter((e) => e.t === "text").map((e) => (e as { d: string }).d).join("");
    expect(text).toContain("You're booked!");

    const db = await getDb();
    const rows = await db.select().from(tables.chatMessages).where(eq(tables.chatMessages.sessionId, sessionId)).orderBy(tables.chatMessages.seq);
    expect(rows.map((r) => r.role)).toEqual(["user", "model", "tool", "model", "tool", "model"]);
    const booking = await db.select().from(tables.consultations).where(eq(tables.consultations.email, "cara@example.com"));
    expect(booking).toHaveLength(1);
    expect(booking[0].bookedVia).toBe("chat");
  });

  it("replays history on a follow-up message and falls back safely when the model fails", async () => {
    const events: ChatEvent[] = [];
    await handleChat({ message: "hi", ipHash: "h", emit: (e) => events.push(e), model });
    const sessionId = (events.find((e) => e.t === "session") as { id: string }).id;

    const seen: AgentContent[][] = [];
    const spyModel: ModelFn = async function* (c) {
      seen.push(structuredClone(c));
      yield { parts: [{ text: "ok" }] };
    };
    await handleChat({ sessionId, message: "thanks", ipHash: "h", emit: () => {}, model: spyModel });
    expect(seen[0].map((c) => c.role)).toEqual(["user", "model", "user"]);

    const failing: ModelFn = async function* () {
      throw new Error("429 quota");
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ev2: ChatEvent[] = [];
    await handleChat({ sessionId, message: "again", ipHash: "h", emit: (e) => ev2.push(e), model: failing });
    spy.mockRestore();
    expect(ev2.some((e) => e.t === "text" && /trouble|try again/i.test(e.d))).toBe(true);
    expect(ev2.at(-1)).toEqual({ t: "done" });
  });

  it("answers with an offline notice when no AI key is configured", async () => {
    const saved = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const events: ChatEvent[] = [];
    await handleChat({ message: "hello", ipHash: "h", emit: (e) => events.push(e) });
    if (saved) process.env.GEMINI_API_KEY = saved;
    expect(events.some((e) => e.t === "text" && /offline/i.test(e.d))).toBe(true);
  });
});
