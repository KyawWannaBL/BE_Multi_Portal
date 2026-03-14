Implemented:
- wired live GET list/report endpoints for:
  - /api/admin/deliverymen/list
  - /api/admin/accounting/transactions/journal-voucher-list
  - /api/admin/accounting/transactions/cash-voucher-list
  - /api/admin/broadcast-message/message-list
- updated adminShellScreens config columns to real snake_case fields
- added KPI summaries for message and voucher list pages

Behavior:
- these pages now read directly from Supabase tables
- filtering supports search, status, date range
- pagination and sorting are active through the generic admin shell page
