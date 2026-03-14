Implemented:
- wired /api/admin/reporting/ways-count-report to Supabase RPC
- frontend now calls api_report_ways_count(...) through supabase.rpc(...)
- existing HTTP fetch behavior remains unchanged for all other endpoints

File updated:
- src/features/admin-shell/api/http.ts

Behavior:
- /api/admin/reporting/ways-count-report no longer depends on a separate backend route
- it returns the same shape expected by AdminShellPage:
  - items
  - total
  - page
  - pageSize
  - summary

Supabase RPC mapping:
- page -> p_page
- pageSize -> p_page_size
- sortBy -> p_sort_by
- sortOrder -> p_sort_order
- dateFrom -> p_date_from
- dateTo -> p_date_to
- branch -> p_branch_id
- township -> p_township
- merchant -> p_merchant_id

Next recommended wires:
- /api/admin/merchants/list -> api_report_merchants
- /api/admin/teams/branches -> api_report_branches
