import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
app.use(cors()); app.use(express.json());

const PORT = process.env.PORT || 8787;
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || "";
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
};

app.post("/notify", async (req, res) => {
  if (NOTIFY_SECRET && req.headers["x-notify-secret"] !== NOTIFY_SECRET) return res.status(401).json({ error: "Unauthorized" });
  
  const { event, payload, actorEmail, at, appBaseUrl } = req.body;
  if (!SUPER_ADMIN_EMAILS.length) return res.json({ ok: true, note: "No recipients" });

  const subject = `[Security] ${event}: ${payload?.email || payload?.subjectEmail || "Event"}`;
  const html = `
    <div style="font-family:sans-serif; color:#333; max-width:600px; margin:0 auto; border:1px solid #eee; border-radius:12px; overflow:hidden;">
      <div style="background:#0f172a; padding:20px; color:white;"><h2>Security Notification</h2></div>
      <div style="padding:20px;">
        <p><strong>Event:</strong> ${event}</p>
        <p><strong>Actor:</strong> ${actorEmail || "System"}</p>
        <div style="background:#f8fafc; padding:15px; border-radius:8px;"><pre>${JSON.stringify(payload, null, 2)}</pre></div>
        ${appBaseUrl ? `<br/><a href="${appBaseUrl}/portal/admin/accounts" style="background:#10b981; color:white; padding:10px 20px; text-decoration:none; border-radius:8px;">Review Platform</a>` : ""}
      </div>
    </div>
  `;

  try {
    const transport = nodemailer.createTransport(SMTP_CONFIG);
    await transport.sendMail({ 
      from: process.env.MAIL_FROM || SMTP_CONFIG.auth.user, 
      to: SUPER_ADMIN_EMAILS.join(","), 
      subject, 
      html 
    });
    res.json({ ok: true, provider: "smtp" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/healthz", (req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`[notify-receiver] listening on :${PORT}`));
