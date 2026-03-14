Implemented:
- backend-query-ready filter params in frontend API layer
- report config enhancements:
  - date range filters
  - date presets
  - branch selectors as filter keys
  - sortable columns
  - totals row config
  - summary KPI cards
  - exportable and printable flags
  - page size and pagination flags
- enhanced report shell page:
  - advanced filters
  - refresh button
  - CSV export
  - Excel export
  - Print / PDF via browser print
  - KPI cards
  - chart preview
  - server-side sorting params
  - pagination footer
  - totals row
- backend SQL scaffolding:
  - report views template
  - paginated JSON API function pattern

Files added:
- src/features/admin-shell/utils/reportExport.ts
- db/reporting/README.md
- db/reporting/report_views_template.sql
- db/reporting/report_api_pattern.sql

Files updated:
- src/features/admin-shell/api/http.ts
- src/config/adminShellScreens.ts
- src/pages/portals/admin/components/AdminShellPage.tsx

Next:
- replace template SQL table names with your real schema
- expose matching API endpoints
- wire branch selectors to real branch option sources
- replace chart preview with final chart library if desired
