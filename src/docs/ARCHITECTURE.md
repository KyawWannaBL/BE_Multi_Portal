# Architecture overview

## Workflow chain

1. Order capture
   - QR / barcode intake
   - OCR label extraction
   - manual creation fallback
2. Pickup execution
   - shipment scan
   - tamper tag binding
   - pickup bag association
   - merchant handover photo and signature
3. Warehouse inbound
   - inbound scan
   - photo QC
   - OCR consistency review
   - slotting and discrepancy handling
4. Dispatch
   - route batch release
   - rider assignment
   - live telemetry
5. Delivery proof
   - destination scan
   - customer / guard / receiver signature
   - delivery photos
   - COD and exceptions
6. Audit and analytics
   - immutable event stream
   - evidence catalog
   - OCR extraction history
   - SLA and exception dashboards

## Recommended service boundaries

- Delivery service: order, parcel, pricing, labels, state
- Workflow service: state transitions and event validation
- Media service: presigned upload, image metadata, quality checks
- OCR service: extraction, normalization, field confidence
- Telemetry service: rider route, live GPS, ETA projections
- Identity / auth service: roles, privileges, branch scope
- Notification service: customer updates and internal alerts

## Frontend module boundaries

- `api/`: all backend calls
- `auth/`: permission constants and guards
- `hooks/`: workflow case loading, live route subscription
- `components/`: signature pad, timeline, media review
- `screens/`: task-oriented operation screens

## Implementation notes

- Keep server-side workflow validation authoritative.
- Treat the frontend as an orchestration layer, not the final source of truth.
- Every major state transition should create:
  - a workflow event row
  - an audit row
  - optional evidence rows
  - optional notifications
- All uploaded media should be content-addressed or UUID-addressed and never overwritten.