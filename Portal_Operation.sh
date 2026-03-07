#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# ✅ YES (both)
# 1) ADMIN/ADM/MGR always get PORTAL_OPERATIONS on approval (even if portal-default toggle off)
# 2) Add ready-to-deploy webhook receiver that sends REAL emails (SMTP) + optional Slack
#    - Frontend notify() already posts to VITE_NOTIFY_WEBHOOK_URL
#    - This patch adds optional secret header support VITE_NOTIFY_WEBHOOK_SECRET
#
# Run from repo root:
#   bash apply-ops-default-and-notify-server.sh
# ==============================================================================

backup() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  cp -f "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
}

ACCOUNT_CONTROL="$(git ls-files | grep -iE 'src/pages/AccountControl\.tsx$' | head -n 1 || true)"
NOTIFY_LIB="$(git ls-files | grep -iE 'src/lib/notify\.ts$' | head -n 1 || true)"

[[ -n "$ACCOUNT_CONTROL" ]] || ACCOUNT_CONTROL="src/pages/AccountControl.tsx"
[[ -n "$NOTIFY_LIB" ]] || NOTIFY_LIB="src/lib/notify.ts"

SERVER_DIR="server/notify-receiver"
SERVER_INDEX="$SERVER_DIR/index.js"
SERVER_TPL="$SERVER_DIR/emailTemplates.js"
SERVER_PKG="$SERVER_DIR/package.json"
SERVER_ENV="$SERVER_DIR/.env.example"
SERVER_README="$SERVER_DIR/README.md"
SERVER_DOCKER="$SERVER_DIR/Dockerfile"

mkdir -p "$(dirname "$ACCOUNT_CONTROL")" "$(dirname "$NOTIFY_LIB")" "$SERVER_DIR"

backup "$ACCOUNT_CONTROL"
backup "$NOTIFY_LIB"
backup "$SERVER_INDEX"
backup "$SERVER_TPL"
backup "$SERVER_PKG"
backup "$SERVER_ENV"
backup "$SERVER_README"
backup "$SERVER_DOCKER"

# ------------------------------------------------------------------------------
# 1) Patch src/lib/notify.ts to send optional secret header
# ------------------------------------------------------------------------------
cat > "$NOTIFY_LIB" <<'EOF'
export type NotifyEvent =
  | "ACCOUNT_REQUEST_CREATED"
  | "ACCOUNT_REQUEST_APPROVED"
  | "ACCOUNT_REQUEST_REJECTED"
  | "AUTHORITY_REQUEST_CREATED"
  | "AUTHORITY_REQUEST_APPROVED"
  | "AUTHORITY_REQUEST_REJECTED";

/**
 * Posts to a webhook if configured.
 * Vite env:
 * - VITE_NOTIFY_WEBHOOK_URL
 * - VITE_NOTIFY_WEBHOOK_SECRET (optional) -> sent as x-notify-secret
 */
export async function notify(event: NotifyEvent, payload: Record<string, unknown>, actorEmail?: string) {
  const url = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_URL as string | undefined;
  if (!url) return;

  const secret = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_SECRET as string | undefined;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-notify-secret": secret } : {}),
      },
      body: JSON.stringify({
        event,
        at: new Date().toISOString(),
        actorEmail: actorEmail ?? null,
        payload,
      }),
    });
  } catch {
    // silent by design
  }
}
EOF

# ------------------------------------------------------------------------------
# 2) Patch AccountControl.tsx: ensure ADMIN/ADM/MGR always receive PORTAL_OPERATIONS on approval
# ------------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/pages/AccountControl.tsx")
if not p.exists():
    print("[skip] AccountControl.tsx not found")
    raise SystemExit(0)

s = p.read_text(encoding="utf-8", errors="ignore")

# Replace portalDefaults calculation inside approveAccount()
# Look for: const portalDefaults = autoPortalDefaults ? defaultPortalPermissionsForRole(nextAcc.role) : [];
pat = re.compile(r"const\s+portalDefaults\s*=\s*autoPortalDefaults\s*\?\s*defaultPortalPermissionsForRole\(nextAcc\.role\)\s*:\s*\[\]\s*;", re.M)

if pat.search(s):
    repl = (
        'const baselinePortal = ["ADMIN", "ADM", "MGR"].includes(String(nextAcc.role)) ? ["PORTAL_OPERATIONS"] : [];\n'
        '    const portalDefaults = Array.from(new Set([\n'
        '      ...baselinePortal,\n'
        '      ...(autoPortalDefaults ? defaultPortalPermissionsForRole(nextAcc.role) : []),\n'
        '    ]));'
    )
    s = pat.sub(repl, s, count=1)
else:
    # fallback: accept variations without semicolon
    pat2 = re.compile(r"const\s+portalDefaults\s*=\s*autoPortalDefaults\s*\?\s*defaultPortalPermissionsForRole\(nextAcc\.role\)\s*:\s*\[\]\s*;?", re.M)
    if pat2.search(s):
        s = pat2.sub(
            'const baselinePortal = ["ADMIN", "ADM", "MGR"].includes(String(nextAcc.role)) ? ["PORTAL_OPERATIONS"] : [];\n'
            '    const portalDefaults = Array.from(new Set([\n'
            '      ...baselinePortal,\n'
            '      ...(autoPortalDefaults ? defaultPortalPermissionsForRole(nextAcc.role) : []),\n'
            '    ]));',
            s,
            count=1
        )
    else:
        print("[warn] Could not find portalDefaults line to patch; please patch manually.")
        # Keep file unchanged if not found

# Optional UX note in approval modal: add hint if not already
hint = "Admins always receive PORTAL_OPERATIONS."
if hint not in s:
    s = s.replace(
        "Portal defaults:",
        "Portal defaults: (Admins always receive PORTAL_OPERATIONS) •"
    )

p.write_text(s, encoding="utf-8")
print("[ok] Patched AccountControl approve flow: ADMIN/ADM/MGR always get PORTAL_OPERATIONS")
PY

# ------------------------------------------------------------------------------
# 3) Create webhook receiver that sends REAL emails (SMTP) + optional Slack
# ------------------------------------------------------------------------------
cat > "$SERVER_PKG" <<'EOF'
{
  "name": "be-notify-receiver",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "nodemailer": "^6.9.14"
  }
}
EOF

cat > "$SERVER_TPL" <<'EOF'
export function subjectFor(event, payload) {
  const e = String(event || "EVENT");
  if (e === "ACCOUNT_REQUEST_CREATED") return `Account Request Created: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_APPROVED") return `Account Approved: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_REJECTED") return `Account Rejected: ${payload?.email ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_CREATED") return `Authority Request Created: ${payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_APPROVED") return `Authority Request Approved: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_REJECTED") return `Authority Request Rejected: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  return `Notification: ${e}`;
}

export function htmlFor(event, body) {
  const { at, actorEmail, payload } = body;
  const pretty = escapeHtml(JSON.stringify(payload ?? {}, null, 2));

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height: 1.4">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(String(event))}</h2>
    <p style="margin:0 0 8px 0;"><b>Time:</b> ${escapeHtml(String(at ?? ""))}</p>
    <p style="margin:0 0 16px 0;"><b>Actor:</b> ${escapeHtml(String(actorEmail ?? ""))}</p>

    <div style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;">${pretty}</pre>
    </div>

    <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">
      BE Multi Portal • Notify Receiver
    </p>
  </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
EOF

cat > "$SERVER_INDEX" <<'EOF'
import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { subjectFor, htmlFor } from "./emailTemplates.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);
const NOTIFY_SECRET = process.env.NOTIFY_SECRET || "";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || "no-reply@example.com";
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

function requireSecret(req) {
  if (!NOTIFY_SECRET) return true;
  return String(req.headers["x-notify-secret"] || "") === NOTIFY_SECRET;
}

function isValidEvent(event) {
  return [
    "ACCOUNT_REQUEST_CREATED",
    "ACCOUNT_REQUEST_APPROVED",
    "ACCOUNT_REQUEST_REJECTED",
    "AUTHORITY_REQUEST_CREATED",
    "AUTHORITY_REQUEST_APPROVED",
    "AUTHORITY_REQUEST_REJECTED",
  ].includes(String(event));
}

function chooseRecipients(event, payload) {
  const e = String(event);
  const p = payload || {};
  const email = (p.email || p.subjectEmail || p?.req?.subjectEmail || "").toString().trim();
  const requestedBy = (p?.req?.requestedBy || p?.requestedBy || "").toString().trim();

  if (e === "ACCOUNT_REQUEST_CREATED") return uniq([...SUPER_ADMIN_EMAILS]);
  if (e === "AUTHORITY_REQUEST_CREATED") return uniq([...SUPER_ADMIN_EMAILS]);

  if (e === "ACCOUNT_REQUEST_APPROVED" || e === "ACCOUNT_REQUEST_REJECTED") {
    return uniq([email, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  }

  if (e === "AUTHORITY_REQUEST_APPROVED" || e === "AUTHORITY_REQUEST_REJECTED") {
    return uniq([email, requestedBy, ...SUPER_ADMIN_EMAILS].filter(Boolean));
  }

  return uniq([...SUPER_ADMIN_EMAILS]);
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

async function sendSlack(event, body) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: `*${event}*\nActor: ${body.actorEmail ?? "-"}\nTime: ${body.at ?? "-"}\nPayload: \n\`\`\`${JSON.stringify(body.payload ?? {}, null, 2)}\`\`\``,
      }),
    });
  } catch {
    // ignore
  }
}

function createTransportOrNull() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

app.get("/healthz", (_, res) => res.json({ ok: true }));

app.post("/notify", async (req, res) => {
  if (!requireSecret(req)) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const { event, at, actorEmail, payload } = req.body || {};
  if (!isValidEvent(event)) {
    return res.status(400).json({ ok: false, error: "INVALID_EVENT" });
  }

  const body = { event, at, actorEmail, payload };

  // Optional Slack
  await sendSlack(event, body);

  const recipients = chooseRecipients(event, payload);
  if (!recipients.length) return res.json({ ok: true, sent: 0, note: "No recipients configured" });

  const transport = createTransportOrNull();
  if (!transport) {
    return res.status(500).json({
      ok: false,
      error: "SMTP_NOT_CONFIGURED",
      hint: "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, SUPER_ADMIN_EMAILS",
    });
  }

  const subject = subjectFor(event, payload);
  const html = htmlFor(event, body);

  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: recipients.join(", "),
      subject,
      html,
    });
    return res.json({ ok: true, sent: recipients.length });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "MAIL_SEND_FAILED", detail: String(err?.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`[notify-receiver] listening on :${PORT}`);
});
EOF

cat > "$SERVER_ENV" <<'EOF'
# =======================
# EN: Notify Receiver env
# MM: Notify Receiver env
# =======================

PORT=8787

# If set, frontend must send x-notify-secret header
# (Set VITE_NOTIFY_WEBHOOK_SECRET to match)
NOTIFY_SECRET=change_me

# SMTP (real email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

MAIL_FROM="BE Multi Portal <your_email@gmail.com>"

# Comma separated list of super admin emails (receives requests)
SUPER_ADMIN_EMAILS=md@britiumexpress.com,md@britiumventures.com

# Optional Slack notifications
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EOF

cat > "$SERVER_README" <<'EOF'
# Notify Receiver (Email/Webhook) — Production Ready

## EN
This service receives events from the frontend `notify()` hook and sends real emails via SMTP.

### Start
```bash
cd server/notify-receiver
cp .env.example .env
npm i
npm run dev