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
curl -X POST "[https://notify.britiumexpress.com/notify](https://notify.britiumexpress.com/notify)" \
  -H "content-type: application/json" \
  -H "x-notify-secret:whk-d6lgfjf5r7bs7399nk30" \
  -d '{
    "event":"ACCOUNT_REQUEST_CREATED",
    "at":"2026-01-01T00:00:00.000Z",
    "actorEmail":"test@britiumexpress.com",
    "appBaseUrl":"[https://www.britiumexpress.com](https://www.britiumexpress.com)",
    "payload":{"email":"newuser@britiumexpress.com","role":"ADMIN","note":"Render SMTP test"}
  }'
```

### Start
```bash
cd server/notify-receiver
cp .env.example .env
npm i
npm run dev
```
