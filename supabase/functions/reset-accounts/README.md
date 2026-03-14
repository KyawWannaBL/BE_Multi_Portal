# reset-accounts (Supabase Edge Function)

This function lets you provision / sync Auth users + `public.profiles` rows in bulk.

## Required secrets (Supabase CLI)

```bash
npx supabase secrets set --project-ref <project_ref> \
  RESET_ADMIN_SECRET="<random-long-secret>" \
  SERVICE_ROLE_KEY="sb_secret_..." \
  INITIAL_PASSWORD="Britium@2026" \
  PROJECT_URL="https://<project_ref>.supabase.co"
```

Notes:
- Each secret must be `NAME=VALUE`.
- Supabase CLI may reject names starting with `SUPABASE_`.

## Call example (dry-run)

```bash
curl -sS "https://<project_ref>.supabase.co/functions/v1/reset-accounts" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: <RESET_ADMIN_SECRET>" \
  -d '{
    "mode":"sync",
    "dry_run": true,
    "accounts":[
      { "email":"md@britiumexpress.com", "role":"APP_OWNER", "must_change_password": true }
    ]
  }'
```

To execute for real, set `dry_run` to `false`.
