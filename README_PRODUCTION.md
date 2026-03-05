# Britium Enterprise (Production Package)

This ZIP is sanitized for production:
- Removed local env files and **all embedded service role keys / secrets**
- Fixed Vite `@` alias + added Tailwind config
- Fixed Tailwind directives for Tailwind v3
- Fixed SuperAdminDashboard auth hook import
- Fixed Playwright preview config (build -> preview -> test)

## Setup

1. Install deps
```bash
npm install
```

2. Configure env (client-side)
Copy `.env.example` -> `.env.local` and set:
- `VITE_SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAPBOX_TOKEN` (optional)

3. Apply Supabase migrations + RLS
Use Supabase CLI or SQL editor to apply:
- `supabase/migrations/*`
- `supabase/rls_policies_enterprise.sql`

4. Run
```bash
npm run dev
```

## E2E
```bash
npm run test:e2e
npm run test:e2e:preview
```

## Seeding users (server-side only)
Use `supabase/functions/set-role-claim/createUsers.js` with env vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEFAULT_PASSWORD`
and edit `useraccount.sample.csv`.

Generated on 2026-03-04.
