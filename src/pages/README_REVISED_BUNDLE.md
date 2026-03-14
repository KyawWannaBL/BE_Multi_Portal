# Revised enterprise delivery flow bundle

This bundle upgrades the way-management and execution flow pages into a backend-connected, bilingual, production-oriented module set.

## Corrected hook
- `hooks/useDeliveryData.ts`

This hook now returns:
- `ways`
- `pickupWays`
- `deliveryWays`
- `failedWays`
- `returnWays`
- `parcelWays`
- `transitWays`
- `trackingWays`
- `loading`
- `error`
- `searchQuery`
- `setSearchQuery`
- `refreshWays`

The hook pulls live data from:
- `DeliveryBackend.searchWays()`

and groups records by normalized `status`, `currentStage`, and `type/flowType` instead of reusing the same array for every tab.

## Updated entry screens
- `WayManagement.tsx`
- `admin/WayManagement.tsx`
- `CreateDelivery.tsx`
- `PickupWays.tsx`
- `DeliverWays.tsx`
- `FailedWays.tsx`
- `ReturnWays.tsx`
- `ParcelInOut.tsx`
- `portals/execution/PickupFlow.tsx`
- `portals/execution/WarehouseDrop.tsx`
- `portals/execution/DeliveryFlow.tsx`
- `portals/ExecutionParcelIntakePage.tsx`
- `portals/ExecutionOcrExportPage.tsx`
- `portals/ExecutionLiveMapPage.tsx`
- `portals/ExecutionNavigationPage.tsx`

## Enterprise feature module
Location:
- `features/production-delivery/*`

### Included functions
- user-friendly enterprise screen flow
- QR scanning with camera + image upload + manual fallback
- pickup chain-of-custody flow
- warehouse / way-management command center
- delivery proof / exception flow
- electronic signature pad
- parcel photo monitoring with blur / light / contrast guidance
- OCR extraction and editable table conversion
- Leaflet live map route panel
- bilingual UI helpers
- backend API contracts and permission guards

## Added / important files
- `features/production-delivery/api.ts`
- `features/production-delivery/permissions.ts`
- `features/production-delivery/components/DeviceQrScanner.tsx`
- `features/production-delivery/components/PhotoEvidenceField.tsx`
- `features/production-delivery/components/SignaturePad.tsx`
- `features/production-delivery/components/WorkflowTimeline.tsx`
- `features/production-delivery/components/LeafletRoutePanel.tsx`
- `features/production-delivery/screens/CreateDeliveryScreen.tsx`
- `features/production-delivery/screens/PickupExecutionScreen.tsx`
- `features/production-delivery/screens/WarehouseExecutionScreen.tsx`
- `features/production-delivery/screens/DeliveryExecutionScreen.tsx`
- `features/production-delivery/screens/WayManagementScreen.tsx`
- `features/production-delivery/screens/FocusedWayListScreen.tsx`
- `features/production-delivery/screens/ParcelIntakeScreen.tsx`
- `features/production-delivery/screens/OcrWorkbenchScreen.tsx`
- `features/production-delivery/screens/LiveTrackingScreen.tsx`

## Backend assumptions
Default base URL:
- `/api/v1`

Endpoints expected:
- `POST /deliveries`
- `PATCH /deliveries/:id`
- `POST /scan/resolve`
- `POST /workflow/pickup-secured`
- `POST /workflow/warehouse-inbound`
- `POST /workflow/warehouse-dispatch`
- `POST /workflow/proof-of-delivery`
- `POST /workflow/failure`
- `GET /deliveries/search`
- `GET /deliveries/:id/events`
- `GET /tracking/live`
- `POST /media/evidence/upload`
- `POST /ocr/extract`
- `POST /ocr/normalize`

## Frontend dependencies to verify
The Leaflet map panel needs:
- `leaflet`
- `react-leaflet`

OCR export page needs:
- `xlsx`

Toast messages need:
- `react-hot-toast`

## Notes
- The hook and screens are written to be mock-free.
- If your backend uses different field names, adjust the normalization helpers in `hooks/useDeliveryData.ts`.
- If your permission model is stricter, wire your exact permission codes in `features/production-delivery/permissions.ts`.
