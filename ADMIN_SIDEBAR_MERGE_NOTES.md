Implemented:
- merged the provided bilingual admin sidebar structure into SuperAdminDashboard
- preserved existing admin routes such as /portal/admin, /portal/admin/users, /portal/admin/merchants, /portal/admin/settings
- added production-safe placeholder routes for newly added menu screens
- kept portal group links to finance, hr, operations, warehouse, branch, merchant, support
- did not delete other developed screens

Next:
- replace placeholder pages with real screen components as layouts are finalized
- keep App.tsx unchanged
- connect APIs per screen later
