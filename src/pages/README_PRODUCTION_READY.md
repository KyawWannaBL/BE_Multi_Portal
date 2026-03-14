Production-ready delivery workflow rewrite

Covered screens
- CreateDelivery.tsx
- WayManagement.tsx
- admin/WayManagement.tsx
- portals/ExecutionPortal.tsx
- portals/execution/RiderDashboard.tsx
- portals/execution/PickupFlow.tsx
- portals/execution/DeliveryFlow.tsx
- portals/execution/WarehouseDrop.tsx
- portals/ExecutionParcelIntakePage.tsx
- portals/ExecutionOcrExportPage.tsx
- portals/ExecutionLiveMapPage.tsx
- portals/ExecutionNavigationPage.tsx

What changed
- removed mock/demo-only behavior from the rewritten screens
- added backend API client using /api/v1 as default base
- device-friendly QR/barcode intake:
  - camera with native BarcodeDetector where available
  - uploaded image scan fallback where available
  - manual input fallback for any device/browser
- parcel photo capture with quality scoring and guidance
- electronic signature canvas
- OCR image/text workflows with editable tables and XLSX export
- warehouse inbound and dispatch workflow screens
- live tracking readiness screen based on backend coordinates and external map deep-links
- bilingual labels using existing LanguageContext

Expected backend endpoints
- POST /api/v1/deliveries
- PATCH /api/v1/deliveries/:id
- POST /api/v1/scan/resolve
- POST /api/v1/workflow/pickup-secured
- POST /api/v1/workflow/warehouse-inbound
- POST /api/v1/workflow/warehouse-dispatch
- POST /api/v1/workflow/proof-of-delivery
- POST /api/v1/workflow/failure
- GET  /api/v1/deliveries/search
- GET  /api/v1/deliveries/:id/events
- GET  /api/v1/tracking/live
- POST /api/v1/media/evidence/upload
- POST /api/v1/ocr/normalize
- POST /api/v1/ocr/extract

Important note
This package is production-readiness code wiring, not a guaranteed full compile of the entire legacy project, because the uploaded zip does not include the whole app, dependency manifest, router, tsconfig, or all shared components/contexts. The rewritten screens are designed to be dropped into the real codebase and connected to live backend services.
