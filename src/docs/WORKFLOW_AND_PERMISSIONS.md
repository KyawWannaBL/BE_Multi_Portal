# Workflow states and permissions

## Workflow states

- `DRAFT`
- `ORDER_CAPTURED`
- `PICKUP_ASSIGNED`
- `PICKUP_SECURED`
- `WAREHOUSE_INBOUND`
- `WAREHOUSE_QC_HOLD`
- `WAREHOUSE_READY`
- `ROUTE_DISPATCHED`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `FAILED_ATTEMPT`
- `RETURN_TO_HUB`
- `CANCELLED`

## Important evidence checkpoints

- pickup seal photo
- merchant handover signature
- warehouse inbound condition photo
- damaged parcel photo
- outbound loading photo
- delivery proof photo
- receiver signature

## Suggested permission map

- `delivery.order.create`
- `delivery.order.read`
- `delivery.order.update`
- `delivery.order.cancel`
- `delivery.order.assign`
- `delivery.pickup.execute`
- `delivery.pickup.override`
- `warehouse.inbound.scan`
- `warehouse.inbound.qc`
- `warehouse.slot.assign`
- `warehouse.dispatch.release`
- `delivery.route.read`
- `delivery.route.live_map`
- `delivery.pod.capture`
- `delivery.exception.resolve`
- `media.upload`
- `media.review`
- `ocr.extract`
- `ocr.review`
- `audit.read`
- `admin.way_management.read`

## Server-side enforcement

The backend should verify:
- actor role and branch scope
- allowed previous state
- required evidence presence
- required scan / signature / COD info
- optimistic concurrency version