Implemented:
- wired /api/admin/merchants/list to Supabase RPC api_report_merchants
- wired /api/admin/teams/branches to Supabase RPC api_report_branches
- kept existing ways count RPC wire-up
- left all other endpoints unchanged

RPC mappings:
- merchants:
  - page -> p_page
  - pageSize -> p_page_size
  - sortBy -> p_sort_by
  - sortOrder -> p_sort_order
  - merchant/search -> p_search
  - status -> p_status

- branches:
  - page -> p_page
  - pageSize -> p_page_size
  - sortBy -> p_sort_by
  - sortOrder -> p_sort_order
  - branch/search -> p_search
  - status -> p_is_active
    - ACTIVE/true => true
    - INACTIVE/false => false
    - empty => null

Files updated:
- src/features/admin-shell/api/http.ts
