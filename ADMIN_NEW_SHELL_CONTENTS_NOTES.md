Implemented:
- added production-ready admin shell screen contents for newly added sidebar routes
- each new shell now has:
  - title
  - bilingual description
  - endpoint config
  - search/filter inputs
  - live API fetch support
  - empty-state handling
  - table rendering when data exists
- no mock data used
- existing screens were preserved

Files added:
- src/features/admin-shell/api/http.ts
- src/config/adminShellScreens.ts
- src/pages/portals/admin/components/AdminShellPage.tsx

File updated:
- src/pages/portals/admin/SuperAdminDashboard.tsx

Next:
- wire each endpoint in src/config/adminShellScreens.ts to your real backend
- replace form-style shells with final dedicated form components later
