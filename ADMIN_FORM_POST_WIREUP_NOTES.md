Implemented:
- wired form POST handlers directly to Supabase inserts

Form endpoint mappings:
- /api/admin/create-delivery -> shipments
- /api/admin/merchants/add-new -> merchants_2026_02_18_17_00
- /api/admin/deliverymen/add-new -> deliverymen
- /api/admin/accounting/transactions/journal-voucher-entry -> journal_vouchers
- /api/admin/accounting/transactions/cash-voucher-entry -> cash_vouchers
- /api/admin/broadcast-message/create-message -> broadcast_messages

Already live report mappings preserved:
- /api/admin/reporting/ways-count-report
- /api/admin/reporting/ways-by-merchants
- /api/admin/reporting/total-ways-by-town
- /api/admin/reporting/overdue-ways-count
- /api/admin/merchants/list
- /api/admin/teams/branches

If a form submit fails now:
- check whether the target table exists
- check whether the target columns exist
- check RLS / insert policy in Supabase
