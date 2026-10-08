import { describe, expect, it } from "vitest";
import { scoreLead } from "@/lib/leads";
import { bookingSchema, chatSchema, leadSchema } from "@/lib/validation";

const base = { type: "contact", name: "Jane Doe", email: "  Jane@Example.COM ", message: "We need a custom LMS for our academy.", consent: true };

describe("validation", () => {
  it("normalises and accepts a valid lead", () => {
    const r = leadSchema.safeParse({ ...base, phone: "", company: "", service: "", link: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("jane@example.com");
      expect(r.data.phone).toBeUndefined();
      expect(r.data.company).toBeUndefined();
    }
  });

  it("rejects bad email, short message, missing consent, bad links and unknown values", () => {
    expect(leadSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, message: "hi" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, link: "javascript:alert(1)" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, type: "chat" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...base, service: "Hacking" }).success).toBe(false);
  });

  it("passes honeypot content through so handlers can drop it silently", () => {
    const r = leadSchema.safeParse({ ...base, website: "http://spam" });
    expect(r.success && r.data.website).toBe("http://spam");
  });

  it("validates bookings and chat input", () => {
    expect(bookingSchema.safeParse({ startsAt: "2026-10-11T04:00:00.000Z", name: "Jane", email: "j@x.io", consent: true }).success).toBe(true);
    expect(bookingSchema.safeParse({ startsAt: "tomorrow", name: "Jane", email: "j@x.io", consent: true }).success).toBe(false);
    expect(chatSchema.safeParse({ message: "x".repeat(1001) }).success).toBe(false);
    expect(chatSchema.safeParse({ message: "hello", sessionId: "not-a-uuid" }).success).toBe(false);
  });

  it("scores leads sensibly", () => {
    const hot = scoreLead({ budget: "$50k – $150k", timeline: "1–3 months", company: "Acme", phone: "+1 555", service: "ERP Solutions", message: "x".repeat(500) });
    const cold = scoreLead({ message: "just looking", budget: null, timeline: null, company: null, phone: null, service: null });
    expect(hot).toBeGreaterThan(80);
    expect(cold).toBeLessThan(10);
  });
});
