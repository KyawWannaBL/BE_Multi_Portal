Implemented:
- wired additional reporting RPC endpoints:
  - /api/admin/reporting/ways-by-merchants
  - /api/admin/reporting/total-ways-by-town
  - /api/admin/reporting/overdue-ways-count
- added real bilingual form renderer:
  - AdminEntityFormPage.tsx
- upgraded AdminShellPage to render real forms when formShell + formFields are present
- replaced shell-only pages with real form definitions:
  - Create Delivery
  - Add New Merchant
  - Add New Deliveryman
  - Journal Voucher Entry
  - Cash Voucher Entry
  - Create Message
- cleaned report config keys closer to snake_case for new live RPC endpoints

Important:
- The three new report endpoints expect these Supabase RPC functions to exist:
  - api_report_ways_by_merchants
  - api_report_total_ways_by_town
  - api_report_overdue_ways_count

Backend note:
- form pages submit POST requests to their configured endpoint
- if those POST endpoints are not implemented yet, the UI will still work but save actions will fail until the backend is added
