# Backend-ready enterprise delivery platform module

This package upgrades the delivery workflow screens into a backend-ready module with:

- typed domain models
- REST/Supabase-friendly API layer
- permission guards
- event timeline and audit trail model
- media upload + photo quality guidance
- OCR extraction pipeline
- QR / barcode intake
- warehouse inbound + QC + dispatch flow
- delivery proof with signature pad
- live map tracking hook and route panel

## Included screens

- `CreateDeliveryEnterprise.tsx`
- `PickupExecution.tsx`
- `WarehouseHubExecution.tsx`
- `DeliveryProofExecution.tsx`
- `WayManagementCommandCenter.tsx`
- `OcrWorkbench.tsx`

## Suggested npm packages

```bash
npm i react-hot-toast react-router-dom lucide-react react-leaflet leaflet
npm i tesseract.js
```

Optional for camera scanning beyond native `BarcodeDetector` fallback:

```bash
npm i @zxing/browser
```

## Suggested alias

This package assumes your app already supports:

```ts
@/...
```

## Recommended backend endpoints

- `POST /api/deliveries`
- `GET /api/deliveries/:id`
- `GET /api/deliveries/search`
- `POST /api/deliveries/:id/assignments`
- `POST /api/workflow/pickup-secured`
- `POST /api/workflow/warehouse-inbound`
- `POST /api/workflow/warehouse-qc`
- `POST /api/workflow/warehouse-dispatch`
- `POST /api/workflow/out-for-delivery`
- `POST /api/workflow/proof-of-delivery`
- `POST /api/workflow/failure`
- `POST /api/media/presign`
- `POST /api/media/evidence`
- `POST /api/ocr/extract`
- `GET /api/routes/:batchId/live`
- `GET /api/admin/ways`

## Suggested integration order

1. Apply `backend/schema.sql`
2. Wire `EnterpriseApiClient` to your backend base URL
3. Plug your auth context into `PermissionGuard`
4. Replace mock upload / OCR implementations with your real services
5. Enable websocket or SSE for `useRealtimeRoute`

## Core permission codes

See `src/features/enterprise-delivery/auth/permissions.ts`.

## Notes

The screens are intentionally backend-ready, not backend-dependent. They can run with mocked responses during development and then be switched over endpoint by endpoint.
