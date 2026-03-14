Implemented:
- added Supabase PATCH/update handlers for:
  - deliverymen
  - journal_vouchers
  - cash_vouchers
  - broadcast_messages
- added edit modal support in AdminShellPage
- added update-capable AdminEntityFormPage mode
- added row action buttons to eligible list screens
- added quick status update buttons
- updated adminShellScreens config with:
  - updateEndpoint
  - formFields for edit mode
  - quickStatusOptions

Result:
- admins can now create, list, edit, and update status for key admin records
