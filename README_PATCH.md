# Britium Enterprise Multi-Portal Patch

## What’s included
- Unified Supabase auth + RBAC provider (no localStorage auth)
- Role portals: Admin, Operations, Supervisor, Warehouse, Branch/Substation, Execution, Data Entry, Staff, Merchant, Customer, Finance, Marketing, HR, Support
- Functional connectivity:
  - Merchant creates shipments (shipments + shipment_tracking)
  - Supervisor assigns to rider/driver/helper (shipments.assigned_rider_id)
  - Execution updates statuses (shipments + shipment_tracking)
  - Customer tracks by Way ID and sees shipment timeline
  - Finance views invoices/transactions and can insert a transaction (if RLS allows)
- Supabase RLS policy templates: `supabase/rls_policies_enterprise.sql`

## Run
1. Copy `.env.example` → `.env.local`
2. Start your app (your repo root should contain package.json, vite config, etc)

## Note
Your database schema contains legacy identity tables (`public.users`, `admin_users_2026_02_04_16_00`) and newer (`profiles`, `users_enhanced`).
The resolver in `src/lib/profile.ts` and `src/services/identity.ts` tries multiple sources.
