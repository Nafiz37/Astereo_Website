import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { translateError } from "@/i18n/errors";
import { budgets, services, timelines } from "@/content/site";

const clean = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const emailField = z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address"));

const phoneField = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\-.\s\d]{6,30}$/, "Enter a valid phone number")
  .optional()
  .or(z.literal("").transform(() => undefined));

/** Honeypot: real users never fill this hidden field. Handlers silently drop submissions that do. */
const honeypot = z.string().max(500).optional();

export const leadSchema = z.object({
  type: z.enum(["contact", "sales", "get_started", "partner", "career"]),
  name: clean(120).min(2, "Please enter your name"),
  email: emailField,
  phone: phoneField,
  company: optionalText(160),
  service: z.enum([...services] as [string, ...string[]]).optional().or(z.literal("").transform(() => undefined)),
  budget: z.enum([...budgets] as [string, ...string[]]).optional().or(z.literal("").transform(() => undefined)),
  timeline: z.enum([...timelines] as [string, ...string[]]).optional().or(z.literal("").transform(() => undefined)),
  message: clean(4000).min(10, "Tell us a little more (at least 10 characters)"),
  /** career: role applied for / link to CV or portfolio. partner: partnership track. */
  role: optionalText(160),
  link: z
    .string()
    .trim()
    .max(500)
    .url("Enter a valid URL (https://...)")
    .refine((v) => /^https?:\/\//i.test(v), "Link must start with http:// or https://")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  source: optionalText(200),
  consent: z.literal(true, { error: "Please accept the privacy policy" }),
  website: honeypot,
});
export type LeadInput = z.infer<typeof leadSchema>;

export const newsletterSchema = z.object({ email: emailField, source: optionalText(100), website: honeypot });

export const bookingSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  name: clean(120).min(2, "Please enter your name"),
  email: emailField,
  phone: phoneField,
  company: optionalText(160),
  topic: z.enum([...services] as [string, ...string[]]).optional().or(z.literal("").transform(() => undefined)),
  notes: optionalText(2000),
  timezone: optionalText(64),
  consent: z.literal(true, { error: "Please accept the privacy policy" }),
  website: honeypot,
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const chatSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(1000),
  timezone: optionalText(64),
  page: optionalText(200),
  lang: z.enum(["en", "bn"]).optional(),
});

export function flattenZodError(err: z.ZodError, lang: Locale = "en") {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    fields[key] ??= translateError(issue.message, lang);
  }
  return fields;
}
