# Media and storage schema

## Recommended buckets

- `delivery-evidence`
- `delivery-signatures`
- `delivery-ocr-source`
- `delivery-labels`

## Path convention

- `delivery-evidence/{yyyy}/{mm}/{deliveryId}/{eventType}/{uuid}.jpg`
- `delivery-signatures/{yyyy}/{mm}/{deliveryId}/{eventType}/{uuid}.png`
- `delivery-ocr-source/{yyyy}/{mm}/{deliveryId}/{uuid}.jpg`

## Metadata to store with each file

- delivery id
- tracking number
- workflow event id
- actor id
- actor role
- capture device
- gps coordinates
- branch / warehouse
- quality scores
- OCR confidence if applicable

## Retention

- proof-of-delivery and signatures: long-term retention
- temporary OCR source images: shorter retention if policy allows
- all audit references must remain even if the actual file is archived to cold storage