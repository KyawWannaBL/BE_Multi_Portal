# Britium Enterprise Multi-Portal Patch

This package contains:
- Updated `src/` (multi-role portals + workflows)
- `supabase/migrations/` (identity mapping view + shipment approval table)
- `supabase/rls_policies_enterprise.sql` (enterprise RLS templates)
- `scripts/` helpers (tsconfig alias patcher)

## Setup

1) Copy `.env.example` to `.env` and confirm values.
2) Apply Supabase migrations:
   - Run the SQL files in `supabase/migrations/` in order
3) Apply RLS templates (optional but recommended):
   - Run `supabase/rls_policies_enterprise.sql` and adjust if needed.

## Role → Portal Routes

- APP_OWNER / SUPER_ADMIN → `/portal/admin` (redirects into `/admin/dashboard`)
- OPERATIONS_ADMIN / STAFF / DATA_ENTRY → `/portal/operations`
- FINANCE_USER / FINANCE_STAFF → `/portal/finance`
- MARKETING_ADMIN → `/portal/marketing`
- HR_ADMIN → `/portal/hr`
- CUSTOMER_SERVICE → `/portal/support`
- SUPERVISOR → `/portal/supervisor`
- WAREHOUSE_MANAGER → `/portal/warehouse`
- SUBSTATION_MANAGER (Branch Manager) → `/portal/branch`
- RIDER / DRIVER / HELPER → `/portal/execution`
- MERCHANT → `/portal/merchant`
- CUSTOMER → `/portal/customer`

## Core Workflow (connected)

1) Merchant creates shipment → `shipments` + `shipment_tracking` + `shipment_approvals (PENDING)`
2) Supervisor approves shipment → `shipment_approvals (APPROVED)` + tracking note
3) Supervisor assigns shipment to delivery team → `shipments.assigned_rider_id` + tracking note
4) Rider/Driver/Helper updates pickup/delivery → updates timestamps + tracking notes
5) Customer tracks by Way ID → reads shipment + tracking history

## Notes

- Shipments/tracking status columns are enums in many deployments; to avoid enum mismatch,
  the UI writes `shipment_tracking.status = 'pending'` and writes real state in `notes`.
  If you know the exact enum values, you can upgrade the service to write true status values.
