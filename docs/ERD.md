# Superbdeal Corp — Conceptual ERD (Frontend Prototype)

> Intended domain model for the QC hub ops workstation.
> App today: in-memory mock data (Zustand), not a live database.

## Relationship overview

- STAFF_USER records movements and releases
- CUSTOMER has VEHICLEs (plate), ORDERs, BOOKings
- PRODUCT has stock + reserved; appears on order lines, release lines, movements
- SALES_ORDER has lines; paymentStatus and fulfillmentStatus are separate
- SHOP_BOOKING uses bay + time slot; may reserve tires
- RELEASE_TICKET has lines; links to order or booking via refId
- B2B quote lines convert into a SALES_ORDER

## Inventory rule

available = on_hand - reserved
