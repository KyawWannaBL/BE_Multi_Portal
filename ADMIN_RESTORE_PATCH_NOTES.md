Implemented:
- restore/unarchive actions for archived rows
- single-row restore button
- bulk restore button
- restore endpoints added to adminShellScreens config

Restore mappings:
- deliverymen: INACTIVE -> ACTIVE
- journal_vouchers: VOID -> DRAFT
- cash_vouchers: VOID -> DRAFT
- broadcast_messages: ARCHIVED -> DRAFT
