ALTER TABLE "consultations" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "reschedule_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "original_starts_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "cancelled_at" timestamp with time zone;