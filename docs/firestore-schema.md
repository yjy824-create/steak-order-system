# Firestore Schema Design

This document describes the MVP Firestore data structure for the steak order system.

## Goals

- Keep the first Firebase integration small and predictable.
- Support frontend ordering, admin order management, and kitchen preparation views.
- Store enough order snapshot data so historical orders remain readable even if product data changes later.
- Avoid coupling the MVP to advanced payment, inventory, or staff permission logic too early.

## Collections

## `orders`

Purpose: stores customer orders submitted from the frontend.

Recommended document id: Firestore auto id.

Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `orderNumber` | string | Human-readable order number, for example `#1023`. |
| `diningType` | string | Dining method, such as `dine-in` or `takeout`. |
| `tableNumber` | string | Table number for dine-in orders. Empty or optional for takeout. |
| `customerNote` | string | Customer-level note for the whole order. |
| `items` | array | Snapshot of ordered products and selected options. |
| `subtotal` | number | Sum of all item totals before service fee. |
| `serviceFee` | number | Calculated service fee amount. |
| `total` | number | Final order total. |
| `status` | string | Order workflow status. |
| `paymentStatus` | string | Payment status. |
| `createdAt` | timestamp | Time when the order was created. |
| `updatedAt` | timestamp | Time when the order was last updated. |

Allowed `status` values:

| Value | Meaning |
| --- | --- |
| `pending` | Order was submitted and is waiting for confirmation. |
| `cooking` | Kitchen is preparing the order. |
| `ready` | Food is ready for pickup or serving. |
| `completed` | Order has been served or picked up. |
| `cancelled` | Order was cancelled. |

Allowed `paymentStatus` values:

| Value | Meaning |
| --- | --- |
| `unpaid` | Payment has not been completed. |
| `paid` | Payment has been completed. |

### Order `items` Structure

Each item should be stored as a snapshot, not only a product reference. This keeps old order records stable when product names, prices, or availability change.

```ts
type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedDoneness?: string;
  selectedSauce?: string;
  addons: Array<{
    name: string;
    price: number;
  }>;
  note: string;
  itemSubtotal: number;
};
```

Example:

```json
{
  "productId": "filet-steak",
  "name": "菲力牛排",
  "price": 450,
  "quantity": 2,
  "selectedDoneness": "五分熟",
  "selectedSauce": "黑胡椒酱",
  "addons": [
    { "name": "可乐", "price": 30 }
  ],
  "note": "少酱",
  "itemSubtotal": 960
}
```

## `products`

Purpose: stores menu product data shown on the frontend and managed by the admin.

Recommended document id: Firestore auto id or a stable slug-like id.

Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Product display name. |
| `categoryId` | string | Reference id of the category document. |
| `categoryName` | string | Denormalized category name for easy display and filtering. |
| `price` | number | Base product price. |
| `description` | string | Short product description. |
| `imageUrl` | string | Product image URL. Can be empty during MVP. |
| `isAvailable` | boolean | Whether customers can order this product. |
| `isRecommended` | boolean | Whether this product appears in recommended sections. |
| `sortOrder` | number | Manual ordering value for display. |
| `createdAt` | timestamp | Time when the product was created. |
| `updatedAt` | timestamp | Time when the product was last updated. |

## `categories`

Purpose: stores product categories used by the menu.

Recommended document id: Firestore auto id or a stable slug-like id.

Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | string | Category display name, such as `牛排`. |
| `slug` | string | Stable URL/code value, such as `steak`. |
| `sortOrder` | number | Manual ordering value for display. |
| `isVisible` | boolean | Whether the category should appear in frontend filters. |
| `createdAt` | timestamp | Time when the category was created. |
| `updatedAt` | timestamp | Time when the category was last updated. |

## `storeSettings`

Purpose: stores store-level settings used by frontend and admin.

Recommended document id: a fixed document id such as `main`.

Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `isOpen` | boolean | Whether the store currently accepts orders. |
| `serviceFeeRate` | number | Service fee rate, for example `0.1` for 10%. |
| `announcement` | string | Customer-facing announcement or temporary notice. |
| `updatedAt` | timestamp | Time when settings were last updated. |

## Read and Write Responsibilities

## Frontend

Reads:

- `products`: show available menu items.
- `categories`: show menu category filters.
- `storeSettings/main`: show open status, announcement, and service fee rate.
- `orders`: read a submitted order by id or order number for status display.

Writes:

- `orders`: create a new order when the customer submits checkout.

MVP note: frontend should write an order snapshot with item names, prices, options, and totals at the moment of submission.

## Admin

Reads:

- `orders`: list and inspect customer orders.
- `products`: list and edit products.
- `categories`: list and edit categories.
- `storeSettings/main`: inspect store settings.

Writes:

- `orders`: update order `status` and possibly `paymentStatus`.
- `products`: create, update, hide, or reorder products.
- `categories`: create, update, hide, or reorder categories.
- `storeSettings/main`: update open status, service fee rate, and announcement.

## Kitchen

Reads:

- `orders`: list active orders, especially `pending`, `cooking`, and `ready`.

Writes:

- `orders`: update `status`, usually from `pending` to `cooking`, then `ready`.

Kitchen should not edit product catalog, category data, or store settings in the MVP.

## MVP Scope

Build first:

- `orders` create and status read.
- `products` read for frontend menu.
- `categories` read for frontend filters.
- `storeSettings/main` read for service fee and store open status.
- Minimal admin order status update.
- Minimal kitchen order status update.

Defer until later:

- Online payment integration.
- Authentication and staff roles.
- Inventory tracking.
- Product option templates.
- Discounts, coupons, and tax rules.
- Multi-branch store support.
- Order cancellation approval flow.
- Realtime notifications beyond Firestore listeners.

## Suggested Indexes

Useful MVP query patterns:

- `orders` by `status` and `createdAt`.
- `orders` by `orderNumber`.
- `products` by `isAvailable`, `categoryId`, and `sortOrder`.
- `categories` by `isVisible` and `sortOrder`.

Firestore may ask for composite indexes after real queries are implemented. Create only the indexes that the app actually needs.

## Security Rules Direction

MVP rules should eventually enforce:

- Customers can create orders with allowed fields only.
- Customers can read only the order they just created if an order lookup token or session mechanism is added.
- Admin users can manage products, categories, store settings, and order statuses.
- Kitchen users can read active orders and update only order `status`.

Detailed rules should be written after authentication strategy is chosen.
