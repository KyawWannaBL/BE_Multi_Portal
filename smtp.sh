#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Render Production Config Generator (EN/MM) - FIXED
# Domain: https://www.britiumexpress.com
# Notify Receiver custom domain: https://notify.britiumexpress.com
#
# Creates:
# - server/notify-receiver/.env.render.sample
# - .env.production.sample
# - render.yaml
# - server/notify-receiver/README_RENDER.md
#
# Replace ALL placeholders: __REPLACE_ME__
# ==============================================================================

mkdir -p server/notify-receiver

cat > server/notify-receiver/.env.render.sample <<'EOF'
# ============================
# Render Notify Receiver (.env)
# ============================

# ---- Server ----
PORT=8787

# ---- Security (IMPORTANT) ----
# EN: Use your Render Webhook ID (whk-...) as NOTIFY_SECRET. Do NOT commit it.
# MM: Render Webhook ID (whk-...) ကို NOTIFY_SECRET အဖြစ်သုံးပါ။ Git ထဲမတင်ပါနှင့်။
NOTIFY_SECRET=whk-d6lgfjf5r7bs7399nk30

# EN: ACTION_SECRET should be a long random secret (different from NOTIFY_SECRET)
# MM: ACTION_SECRET ကို random အရှည်ကြီး secret သတ်မှတ်ပါ (NOTIFY_SECRET နဲ့မတူရ)
ACTION_SECRET=whsec_VrdckfV1cllVVdE6rNgwOfrRtuyj66mTzu7U/gyK1WcW5SSx5PXcP/lxkAvkSR+gEysL76sQ0thpMaii4kLqLA==

# ---- Platform base URL (for action links in email) ----
APP_BASE_URL=https://www.britiumexpress.com

# ---- Super Admin recipients ----
SUPER_ADMIN_EMAILS=md@britiumexpress.com,md@britiumventures.com

# ---- Provider (SendGrid optional) ----
# EN: If you use SendGrid API, set BOTH. Otherwise leave empty and SMTP will be used.
# MM: SendGrid API သုံးမယ်ဆိုရင် အောက်က ၂ ခုလုံးထည့်ပါ၊ မသုံးရင် အလွတ်ထားပါ (SMTP သုံးမယ်)
SENDGRID_API_KEY=
SENDGRID_FROM="Britium Express <no-reply@britiumexpress.com>"

# ---- SMTP (your hosting) ----
SMTP_HOST=mailpro-01.zth.netdesignhost.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=admin@britiumexpress.com
SMTP_PASS=__REPLACE_ME__

# EN: If your host rejects "From" that is not SMTP_USER, set MAIL_FROM=admin@britiumexpress.com
# MM: SMTP host က From ကိုမလက်ခံရင် MAIL_FROM ကို SMTP_USER နဲ့တူအောင်ထားပါ
MAIL_FROM="Britium Express <no-reply@britiumexpress.com>"

# ---- Optional Slack ----
SLACK_WEBHOOK_URL=
EOF

cat > .env.production.sample <<'EOF'
# ===================================
# Frontend (Vite) Production ENV
# ===================================

# EN/MM: Notify receiver public URL (Render custom domain recommended)
VITE_NOTIFY_WEBHOOK_URL=https://notify.britiumexpress.com/notify

# ✅ FIX: base URL MUST NOT include /notify
VITE_NOTIFY_RECEIVER_BASE_URL=https://notify.britiumexpress.com

# EN/MM: must match server NOTIFY_SECRET (your whk-...)
VITE_NOTIFY_WEBHOOK_SECRET=whk-d6lgfjf5r7bs7399nk30`
# Web domain
VITE_APP_BASE_URL=https://www.britiumexpress.com
EOF

cat > render.yaml <<'EOF'
# ============================================
# Render Blueprint (optional, production-ready)
# NOTE: Put REAL secrets in Render Dashboard, NOT in git.
# ============================================
services:
  - type: web
    name: be-notify-receiver
    runtime: node
    plan: starter
    region: singapore
    rootDir: server/notify-receiver
    buildCommand: npm ci --omit=dev
    startCommand: node index.js
    healthCheckPath: /healthz
    envVars:
      - key: PORT
        value: "8787"
      - key: APP_BASE_URL
        value: "https://www.britiumexpress.com"
      - key: SUPER_ADMIN_EMAILS
        value: "md@britiumexpress.com,md@britiumventures.com"

      # ⛔ DO NOT COMMIT REAL SECRETS
      - key: NOTIFY_SECRET
        value: "__REPLACE_ME__"
      - key: ACTION_SECRET
        value: "__REPLACE_ME__"

      # SMTP
      - key: SMTP_HOST
        value: "mailpro-01.zth.netdesignhost.com"
      - key: SMTP_PORT
        value: "587"
      - key: SMTP_SECURE
        value: "false"
      - key: SMTP_USER
        value: "admin@britiumexpress.com"
      - key: SMTP_PASS
        value: "__REPLACE_ME__"
      - key: MAIL_FROM
        value: "Britium Express <no-reply@britiumexpress.com>"
EOF

cat > server/notify-receiver/README_RENDER.md <<'EOF'
# Render Deployment — Notify Receiver (Britium Express)

## EN
### 1) Render Web Service
- Root: `server/notify-receiver`
- Build: `npm ci --omit=dev`
- Start: `node index.js`
- Health: `/healthz`

### 2) Render Env Vars (set in Dashboard)
Required:
- APP_BASE_URL=https://www.britiumexpress.com
- SUPER_ADMIN_EMAILS=md@britiumexpress.com,md@britiumventures.com

Secrets:
- `NOTIFY_SECRET=whk-d6lgfjf5r7bs7399nk30` (whk-....)
- `ACTION_SECRET=whsec_VrdckfV1cllVVdE6rNgwOfrRtuyj66mTzu7U/gyK1WcW5SSx5PXcP/lxkAvkSR+gEysL76sQ0thpMaii4kLqLA== ` (random long secret)
SMTP:
- SMTP_HOST=mailpro-01.zth.netdesignhost.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=admin@britiumexpress.com
- SMTP_PASS=Ph0ech@n2026
- MAIL_FROM=Britium Express <no-reply@britiumexpress.com>

If SMTP rejects MAIL_FROM, set:
- MAIL_FROM=Britium Express <admin@britiumexpress.com>

### 3) Custom domain (recommended)
Use: `notify.britiumexpress.com`
DNS: CNAME `notify` -> Render service hostname

### 4) Frontend Vite env
- VITE_NOTIFY_WEBHOOK_URL=https://notify.britiumexpress.com/notify
- VITE_NOTIFY_RECEIVER_BASE_URL=https://notify.britiumexpress.com
- VITE_NOTIFY_WEBHOOK_SECRET=whk-d6lgfjf5r7bs7399nk30(same as NOTIFY_SECRET)
- VITE_APP_BASE_URL=https://www.britiumexpress.com

### 5) Quick test
```bash
curl -X POST "https://notify.britiumexpress.com/notify" \
  -H "content-type: application/json" \
  -H "x-notify-secret:whk-d6lgfjf5r7bs7399nk30" \
  -d '{
    "event":"ACCOUNT_REQUEST_CREATED",
    "at":"2026-01-01T00:00:00.000Z",
    "actorEmail":"test@britiumexpress.com",
    "appBaseUrl":"https://www.britiumexpress.com",
    "payload":{"email":"newuser@britiumexpress.com","role":"ADMIN","note":"Render SMTP test"}
  }'