/**
 * End-to-end smoke test for a RUNNING Astareo site (local or deployed).
 *
 *   npm run smoke                                   # against http://localhost:3000, reads .env.local
 *   BASE=https://your-app.vercel.app ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='...' npm run smoke
 *
 * Options: EMAIL_MODE=1 sends real emails to SMOKE_EMAIL_BASE (default: the SMTP user's inbox, via plus-addressing),
 *          WITH_AI=1 also exercises the live AI assistant (uses model quota).
 * WARNING: it creates real test leads/bookings (and cancels the bookings) in the target database.
 */
import { existsSync, readFileSync } from "node:fs";

const fileEnv = existsSync(".env.local")
  ? Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split("\n")
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
    )
  : {};
const env = { ...fileEnv, ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v)) };
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (plain text, for the smoke test only) in the environment or .env.local.");
  process.exit(2);
}
const B = process.env.BASE ?? "http://localhost:3000";
const EMAIL_MODE = process.env.EMAIL_MODE === "1"; // real emails: keep them few, all to the owner's inbox
const WITH_AI = process.env.WITH_AI === "1";
let pass = 0;
let fail = 0;
const t = (name, ok, extra = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
};
const J = async (p, o = {}) => {
  const r = await fetch(B + p, { ...o, headers: { "x-forwarded-for": IP, ...(o.headers ?? {}) } });
  let b = null;
  try {
    b = await r.clone().json();
  } catch {}
  return { s: r.status, b, h: r.headers, r };
};
const post = (p, body, h = {}) => J(p, { method: "POST", headers: { "content-type": "application/json", ...h }, body: JSON.stringify(body) });
const patch = (p, body, h = {}) => J(p, { method: "PATCH", headers: { "content-type": "application/json", ...h }, body: JSON.stringify(body) });
const uniq = Date.now().toString(36);
// Each run is a distinct client, so earlier runs cannot use up this run's rate-limit allowance.
const fresh = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
const IP = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
// Gmail plus-addressing: every test address is distinct but all mail lands in the sender's own inbox.
const MAIL_BASE = (process.env.SMOKE_EMAIL_BASE ?? env.SMTP_USER ?? "").split("@");
const mail = (n) => (EMAIL_MODE && MAIL_BASE.length === 2 ? `${MAIL_BASE[0]}+qa${uniq}${n}@${MAIL_BASE[1]}` : `qa+${uniq}${n}@example.com`);
const parseCsv = (csv) => {
  const rows = csv.split("\r\n");
  const head = rows[0].split(",").map((x) => x.replace(/"/g, ""));
  const find = (needle) => {
    const r = rows.find((x) => x.includes(needle));
    return r ? Object.fromEntries((r.match(/"([^"]*)"/g) ?? []).map((x, i) => [head[i], x.slice(1, -1)])) : null;
  };
  return { head, find };
};

// ---- health + admin login
const hl = await J("/api/health");
t("health", hl.s === 200 && hl.b.database && hl.b.admin, JSON.stringify(hl.b));
const lg = await post("/api/admin/login", { email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
const cookie = (lg.h.get("set-cookie") ?? "").split(";")[0];
t("admin login ok + httpOnly cookie", lg.s === 200 && /HttpOnly/i.test(lg.h.get("set-cookie") ?? ""));
t("admin login wrong password rejected", (await post("/api/admin/login", { email: env.ADMIN_EMAIL, password: "wrong-wrong-wrong" })).s === 401);
const A = { cookie };

// ---- lead forms (all types accepted by the API)
const lead = (type, extra = {}) => post("/api/leads", { type, name: "QA Tester", email: mail(type), company: "QA Ltd", phone: "+880 1700 000000", message: `Automated QA ${type} submission ${uniq}`, consent: true, ...extra });
const types = EMAIL_MODE ? ["contact"] : ["contact", "sales", "partner", "career"];
for (const ty of types) {
  const r = await lead(ty, ty === "career" ? { link: "https://example.com/cv", role: "Open application" } : ty === "sales" ? { service: "ERP Solutions", budget: "$50k – $150k", timeline: "1–3 months" } : {});
  t(`lead type=${ty}`, r.s === 200 && r.b.ok && !!r.b.id);
}
const bad = await post("/api/leads", { type: "contact", name: "x", email: "bad", message: "short", consent: false }, { "x-forwarded-for": fresh() });
t("lead validation (en) returns field errors", bad.s === 422 && !!bad.b.fields.email && !!bad.b.fields.consent);
const badBn = await post("/api/leads", { type: "contact", name: "x", email: "bad", message: "short", consent: false }, { "x-lang": "bn", "x-forwarded-for": fresh() });
t("lead validation (bn) errors are Bangla", badBn.s === 422 && /[ঀ-৿]/.test(badBn.b.fields.email));
t("honeypot silently dropped (200, null id)", (await post("/api/leads", { type: "contact", name: "Bot Bot", email: "bot@example.com", message: "buy now buy now", consent: true, website: "http://spam" }, { "x-forwarded-for": fresh() })).b?.id === null);
t("javascript: link rejected", (await post("/api/leads", { type: "career", name: "QA", email: "a@example.com", message: "xxxxxxxxxxxx", consent: true, link: "javascript:alert(1)" }, { "x-forwarded-for": fresh() })).s === 422);
t("cross-origin POST blocked", (await post("/api/leads", {}, { origin: "https://evil.example" })).s === 403);
t("oversized body rejected with 413", (await J("/api/leads", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": fresh() }, body: JSON.stringify({ message: "x".repeat(300000) }) })).s === 413);
t("invalid JSON rejected with 400", (await J("/api/leads", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": fresh() }, body: "{not json" })).s === 400);

// ---- rate limiting (a different client IP so the rest of the run is unaffected)
const rl = [];
for (let i = 0; i < 7; i++) rl.push((await J("/api/leads", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `172.31.${Math.floor(Math.random() * 250)}.9` }, body: "{}" })).s);
t("sanity: invalid posts from a fresh IP are 422, not blocked", rl.every((x) => x === 422), rl.join());
const rlIp = `172.30.${Math.floor(Math.random() * 250)}.7`;
const rlCodes = [];
for (let i = 0; i < 7; i++) rlCodes.push((await J("/api/leads", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": rlIp }, body: "{}" })).s);
t("leads endpoint rate-limits one IP (5 per 10 min)", rlCodes.slice(0, 5).every((x) => x === 422) && rlCodes.slice(5).every((x) => x === 429), rlCodes.join());

// ---- newsletter + unsubscribe
const nm = `news+${uniq}@example.com`;
t("newsletter subscribe", (await post("/api/newsletter", { email: nm, source: "qa" })).b?.ok === true);
t("newsletter duplicate is idempotent", (await post("/api/newsletter", { email: nm })).b?.ok === true);
const subs = parseCsv(await (await fetch(B + "/api/admin/export?type=subscribers", { headers: A })).text());
const unsub = subs.find(nm)?.unsubscribeToken;
const u1 = unsub ? await fetch(`${B}/api/newsletter/unsubscribe?token=${unsub}`) : null;
t("unsubscribe link works", !!u1 && u1.status === 200 && /unsubscribed/i.test(await u1.text()));
t("unsubscribe bad token handled", (await fetch(`${B}/api/newsletter/unsubscribe?token=zzzzzzzzzzzz`)).status === 200);

// ---- search API
for (const lang of ["en", "bn"]) {
  const s = await J(`/api/search?lang=${lang}`);
  t(`search index ${lang}`, s.s === 200 && s.b.length > 40);
}

// ---- booking lifecycle
const slots = (await J("/api/consultation/slots")).b.slots;
t(
  "slots exist and only Sun-Thu 10:00-18:00 Dhaka",
  slots.length > 100 &&
    slots.every((iso) => {
      const d = new Date(Date.parse(iso) + 6 * 3600e3);
      return [0, 1, 2, 3, 4].includes(d.getUTCDay()) && d.getUTCHours() >= 10 && d.getUTCHours() < 18;
    }),
);
const mid = Math.floor(slots.length / 2);
const off = slots[mid];
const bk = await post("/api/consultation/book", { startsAt: off, name: "QA Booker", email: mail("book"), topic: "AI Agent Integration", consent: true, timezone: "Europe/London" }, { "x-lang": "bn" });
t("book (bn locale)", bk.s === 200 && bk.b.ok, `emailed=${bk.b.emailed}`);
t("double-book same slot -> 409", (await post("/api/consultation/book", { startsAt: off, name: "Other Person", email: mail("other"), consent: true })).s === 409);
t("book non-offered time -> 409", (await post("/api/consultation/book", { startsAt: new Date(Date.parse(off) + 60000).toISOString(), name: "Other Person", email: mail("o2"), consent: true })).s === 409);
t("book past time -> 409", (await post("/api/consultation/book", { startsAt: "2020-01-01T04:00:00.000Z", name: "Other Person", email: mail("o3"), consent: true })).s === 409);
const id = bk.b.booking.id;
const stored = parseCsv(await (await fetch(B + "/api/admin/export?type=consultations", { headers: A })).text()).find(id);
const token = stored?.cancelToken;
t("booking stored with bn locale + visitor timezone", stored?.locale === "bn" && stored?.visitorTimezone === "Europe/London");
const mg = await J(`/api/consultation/manage?id=${id}&token=${token}`);
t("manage GET (valid)", mg.s === 200 && mg.b.booking.canReschedule === true);
t("manage GET wrong token is 404 (no leak)", (await J(`/api/consultation/manage?id=${id}&token=wrongwrongwrong`)).s === 404);
const newSlot = slots[mid + 3];
const rs = await post("/api/consultation/reschedule", { id, token, startsAt: newSlot });
t("reschedule", rs.s === 200 && rs.b.booking.rescheduleCount === 1, `emailed=${rs.b.emailed}`);
const afterSlots = (await J("/api/consultation/slots")).b.slots;
t("old slot freed and new slot taken", afterSlots.includes(off) && !afterSlots.includes(newSlot));
t("reschedule wrong token rejected", (await post("/api/consultation/reschedule", { id, token: "wrongwrongwrong", startsAt: slots[1] })).s === 404);
for (const p of [`/get-started/manage?id=${id}&token=${token}`, `/bn/get-started/manage?id=${id}&token=${token}`]) t(`manage page ${p.split("?")[0]}`, (await fetch(B + p)).status === 200);
const adm = await fetch(`${B}/admin/consultations?view=upcoming`, { headers: A });
const admHtml = await adm.text();
t("admin tracker lists booking with reschedule badge", adm.status === 200 && admHtml.includes("QA Booker") && /rescheduled/i.test(admHtml));
const cn = await post("/api/consultation/cancel", { id, token });
t("visitor cancel", cn.s === 200 && cn.b.ok);
t("cancel twice rejected", (await post("/api/consultation/cancel", { id, token })).s === 404);
t("slot free after cancel", (await J("/api/consultation/slots")).b.slots.includes(newSlot));
const b2 = await post("/api/consultation/book", { startsAt: slots[mid + 8], name: "QA Admin Cancel", email: mail("adm"), consent: true });
t("admin PATCH booking status -> cancelled", (await patch(`/api/admin/consultations/${b2.b.booking.id}`, { status: "cancelled" }, A)).s === 200);
t("admin PATCH requires auth", (await patch(`/api/admin/consultations/${b2.b.booking.id}`, { status: "completed" })).s === 401);
const capEmail = mail("cap");
const capCodes = [];
for (let i = 0; i < 3; i++) capCodes.push((await post("/api/consultation/book", { startsAt: slots[20 + i * 2], name: "Cap Test", email: capEmail, consent: true }, { "x-forwarded-for": fresh() })).s);
t("per-email cap of 2 upcoming bookings", capCodes.join() === "200,200,429", capCodes.join());

// ---- admin pages and APIs
for (const p of ["/admin", "/admin/leads", "/admin/consultations", "/admin/chats", "/admin/subscribers"]) t(`admin page ${p} (authed)`, (await fetch(B + p, { headers: A })).status === 200);
t("admin redirects when logged out", (await fetch(B + "/admin/leads", { redirect: "manual" })).status === 307);
t("admin export blocked when logged out", (await J("/api/admin/export?type=leads")).s === 401);
const leadRow = parseCsv(await (await fetch(B + "/api/admin/export?type=leads", { headers: A })).text()).find("Automated QA contact");
t("admin PATCH lead status and notes", !!leadRow && (await patch(`/api/admin/leads/${leadRow.id}`, { status: "contacted", notes: "=cmd|' /C calc'!A0" }, A)).s === 200);
const csvL2 = await (await fetch(B + "/api/admin/export?type=leads", { headers: A })).text();
t("CSV neutralises formula injection", csvL2.includes(`"'=cmd`) && !csvL2.includes(`,"=cmd`));
if (EMAIL_MODE) {
  const te = await post("/api/admin/test-email", {}, A);
  t("admin test-email sends", te.s === 200 && te.b.ok, JSON.stringify(te.b));
}
t("logout", (await post("/api/admin/logout", {}, A)).s === 200);

// ---- AI assistant (live Gemini)
if (WITH_AI) {
  const chat = async (message, extra = {}) => {
    const r = await fetch(B + "/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message, timezone: "Asia/Dhaka", ...extra }) });
    const txt = await r.text();
    const ev = txt.split("\n").filter(Boolean).map((l) => JSON.parse(l));
    return { s: r.status, text: ev.filter((e) => e.t === "text").map((e) => e.d).join(""), tools: ev.filter((e) => e.t === "tool").map((e) => e.name), done: ev.at(-1)?.t === "done" };
  };
  const FALLBACK = /trouble answering|offline right now|উত্তর দিতে সমস্যা|অফলাইনে আছে/;
  const real = (x) => x.s === 200 && x.done && !FALLBACK.test(x.text) && x.text.length > 30;
  const snip = (x) => `"${x.text.slice(0, 80).replace(/\n/g, " ")}…"`;
  const en = await chat("What does Astareo build? Answer in two sentences.");
  t("chat EN streams a REAL model reply (not the fallback)", real(en) && en.tools.includes("get_services"), `tools=[${en.tools}] ${snip(en)}`);
  const bnr = await chat("আপনারা কী কী সেবা দেন?", { lang: "bn" });