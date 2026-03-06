import "dotenv/config"; import express from "express"; import cors from "cors"; import nodemailer from "nodemailer"; import { subjectFor, htmlFor } from "./emailTemplates.js";
const app = express(); app.use(cors({ origin: true })); app.use(express.json({ limit: "1mb" }));
const PORT = Number(process.env.PORT || 8787); const NOTIFY_SECRET = process.env.NOTIFY_SECRET || ""; const SMTP_HOST = process.env.SMTP_HOST || ""; const SMTP_PORT = Number(process.env.SMTP_PORT || 587); const SMTP_USER = process.env.SMTP_USER || ""; const SMTP_PASS = process.env.SMTP_PASS || ""; const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"; const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "no-reply@example.com"; const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean); const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
function requireSecret(req) { if (!NOTIFY_SECRET) return true; return String(req.headers["x-notify-secret"] || "") === NOTIFY_SECRET; }
function isValidEvent(event) { return ["ACCOUNT_REQUEST_CREATED", "ACCOUNT_REQUEST_APPROVED", "ACCOUNT_REQUEST_REJECTED", "AUTHORITY_REQUEST_CREATED", "AUTHORITY_REQUEST_APPROVED", "AUTHORITY_REQUEST_REJECTED"].includes(String(event)); }
function chooseRecipients(event, payload) {
  const e = String(event); const p = payload || {}; const email = (p.email || p.subjectEmail || p?.req?.subjectEmail || "").toString().trim(); const requestedBy = (p?.req?.requestedBy || p?.requestedBy || "").toString().trim();
  if (e === "ACCOUNT_REQUEST_CREATED" || e === "AUTHORITY_REQUEST_CREATED") return uniq([...SUPER_ADMIN_EMAILS]);
  if (e === "ACCOUNT_REQUEST_APPROVED" || e === "ACCOUNT_REQUEST_REJECTED") return uniq([email, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  if (e === "AUTHORITY_REQUEST_APPROVED" || e === "AUTHORITY_REQUEST_REJECTED") return uniq([email, requestedBy, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  return uniq([...SUPER_ADMIN_EMAILS]);
}
function uniq(arr) { return Array.from(new Set(arr)); }
async function sendSlack(event, body) { if (!SLACK_WEBHOOK_URL) return; try { await fetch(SLACK_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: `*${event}*\nActor: ${body.actorEmail ?? "-"}\nTime: ${body.at ?? "-"}\nPayload: \n\`\`\`${JSON.stringify(body.payload ?? {}, null, 2)}\`\`\`` }) }); } catch {} }
function createTransportOrNull() { if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null; return nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE, auth: { user: SMTP_USER, pass: SMTP_PASS } }); }
app.get("/healthz", (_, res) => res.json({ ok: true }));
app.post("/notify", async (req, res) => {
  if (!requireSecret(req)) return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  const { event, at, actorEmail, payload } = req.body || {};
  if (!isValidEvent(event)) return res.status(400).json({ ok: false, error: "INVALID_EVENT" });
  const body = { event, at, actorEmail, payload };
  await sendSlack(event, body);
  const recipients = chooseRecipients(event, payload);
  if (!recipients.length) return res.json({ ok: true, sent: 0, note: "No recipients configured" });
  const transport = createTransportOrNull();
  if (!transport) return res.status(500).json({ ok: false, error: "SMTP_NOT_CONFIGURED", hint: "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, SUPER_ADMIN_EMAILS" });
  const subject = subjectFor(event, payload); const html = htmlFor(event, body);
  try { await transport.sendMail({ from: MAIL_FROM, to: recipients.join(", "), subject, html }); return res.json({ ok: true, sent: recipients.length }); } catch (err) { return res.status(500).json({ ok: false, error: "MAIL_SEND_FAILED", detail: String(err?.message || err) }); }
});
app.listen(PORT, () => { console.log(`[notify-receiver] listening on :${PORT}`); });
