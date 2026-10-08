import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import { bookConsultation, listOpenSlots } from "@/lib/bookings";
import { createLead } from "@/lib/leads";
import { emailProvider, sendEmail } from "@/lib/email";

const received: ParsedMail[] = [];
let server: SMTPServer;
const env = { ...process.env };

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: false,
    allowInsecureAuth: true,
    disabledCommands: ["STARTTLS"],
    onAuth(auth, _session, cb) {
      if (auth.username === "mailer@example.com" && auth.password === "app-password") cb(null, { user: auth.username });