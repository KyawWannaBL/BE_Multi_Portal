Implemented:
- added soft-delete/archive handlers via Supabase PATCH
- added Archive buttons to row action area
- archive behavior is status-based, not hard delete
- updated config with archiveEndpoint values

Archive mappings:
- deliverymen -> INACTIVE
- journal_vouchers -> VOID
- cash_vouchers -> VOID
- broadcast_messages -> ARCHIVED
