import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import { eq } from "drizzle-orm";
import { getDb, tables } from "@/db";
import { adminSetBookingStatus, bookConsultation, cancelConsultation, findBookingByToken, listOpenSlots, rescheduleConsultation } from "@/lib/bookings";

const mails: ParsedMail[] = [];
let server: SMTPServer;