import { sql } from "drizzle-orm";
import { bigserial, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, boolean } from "drizzle-orm/pg-core";

export const LEAD_TYPES = ["contact", "sales", "get_started", "partner", "career", "chat"] as const;
export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost", "spam"] as const;
export const BOOKING_STATUSES = ["confirmed", "cancelled", "completed", "no_show"] as const;

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type", { enum: LEAD_TYPES }).notNull(),
    status: text("status", { enum: LEAD_STATUSES }).notNull().default("new"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    service: text("service"),
    budget: text("budget"),
    timeline: text("timeline"),
    message: text("message"),
    score: integer("score").notNull().default(0),
    source: text("source"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_created_idx").on(t.createdAt), index("leads_email_idx").on(t.email), index("leads_status_idx").on(t.status)],
);

export const consultations = pgTable(
  "consultations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    topic: text("topic"),
    notes: text("notes"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull().default(30),
    visitorTimezone: text("visitor_timezone"),
    status: text("status", { enum: BOOKING_STATUSES }).notNull().default("confirmed"),
    cancelToken: text("cancel_token").notNull(),
    bookedVia: text("booked_via").notNull().default("web"),
    /** Language the visitor booked in; used for links in emails. */
    locale: text("locale").notNull().default("en"),
    /** How many times the visitor moved the booking. Also the iCalendar SEQUENCE so calendars update the same event. */
    rescheduleCount: integer("reschedule_count").notNull().default(0),
    /** The first time that was booked, kept when the booking is moved. */
    originalStartsAt: timestamp("original_starts_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // A slot can only be held by one confirmed booking: this is what prevents double-booking.
    uniqueIndex("consultations_slot_unique").on(t.startsAt).where(sql`${t.status} = 'confirmed'`),
    index("consultations_starts_idx").on(t.startsAt),
  ],
);

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  needsHuman: boolean("needs_human").notNull().default(false),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Monotonic ordering key (timestamps can tie within a millisecond). */
    seq: bigserial("seq", { mode: "number" }).notNull(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    /** user | model | tool (tool = function responses, stored as Gemini "user" content) */
    role: text("role", { enum: ["user", "model", "tool"] }).notNull(),
    /** Display text (empty for pure tool-call turns). */
    text: text("text").notNull().default(""),
    /** Raw Gemini Content parts, replayed verbatim as conversation history. */
    parts: jsonb("parts").$type<unknown[]>().notNull(),