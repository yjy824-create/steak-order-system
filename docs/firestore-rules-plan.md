# Firestore Rules Plan

This document is a planning note for tightening Firestore Security Rules before launch.

## 1. Current Development Rules

During local development, the project may temporarily allow open reads and writes for collections such as:

- `firebase_test`
- `orders`

Example development behavior:

```js
allow read, write: if true;
```

This is useful only for confirming Firebase SDK setup, Firestore connectivity, order creation, admin order updates, and kitchen status updates.

Important: this rule is not safe for production and must not be used for launch.

## 2. MVP Permission Needs

## Frontend Customers

Customers should be allowed to:

- Create new `orders`.
- Read only the order they just created.

Customers should not be allowed to:

- Read all orders.
- Update order workflow status.
- Manage products or categories.
- Delete orders.

## Admin Users

Admins should be allowed to:

- Read all `orders`.
- Update order status.
- Manage `products`.
- Manage `categories`.
- Update store settings in a later step.

Admins should not rely on public access rules. Admin privileges should come from authentication and role checks.

## Kitchen Staff

Kitchen staff should be allowed to:

- Read `orders`.
- Update order status for kitchen workflow:
  - `pending`
  - `cooking`
  - `ready`

Kitchen staff should not be allowed to:

- Delete orders.
- Edit product catalog data.
- Edit category data.
- Modify payment fields.
- Modify customer order item contents.

## 3. Current Missing Authentication Layer

The project does not yet have Firebase Authentication.

Because there is no login system, Firestore Rules cannot reliably distinguish between:

- Customer
- Admin
- Kitchen staff

Before production launch, the project should add at least one of the following:

- Admin login.
- Simple staff authentication.
- Firebase Auth users with role data.
- Custom claims for admin and staff roles.

Without authentication, any browser client can potentially behave like an admin if rules are too open.

## 4. Temporary Development Rules Example

The following example is only for local development and testing.

Do not use this for production.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /firebase_test/{documentId} {
      allow read, write: if true;
    }

    match /orders/{orderId} {
      allow read, write: if true;
    }

    match /products/{productId} {
      allow read, write: if true;
    }

    match /categories/{categoryId} {
      allow read, write: if true;
    }
  }
}
```

This temporary setup supports MVP development for:

- Firestore connection testing.
- Frontend order submission.
- Admin order status updates.
- Kitchen order status updates.
- Product and category management experiments.

## 5. Future Production Rules Direction

Production rules should be based on Firebase Auth and role checks.

Recommended direction:

- Use Firebase Authentication.
- Create an `adminUsers` or `staffUsers` collection.
- Store staff role information such as:
  - `admin`
  - `kitchen`
- Consider Firebase Auth custom claims for stronger role checks.
- Customers should only read orders that belong to them.
- Kitchen users should only update order `status` and `updatedAt`.
- Admin users should manage orders, products, categories, and settings.

Possible role helper functions:

```js
function isSignedIn() {
  return request.auth != null;
}

function isAdmin() {
  return isSignedIn()
    && exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid));
}

function isKitchen() {
  return isSignedIn()
    && get(/databases/$(database)/documents/staffUsers/$(request.auth.uid)).data.role == "kitchen";
}
```

Possible production direction:

```js
match /orders/{orderId} {
  allow create: if true;
  allow read: if isAdmin() || isKitchen() || request.auth.uid == resource.data.customerId;
  allow update: if isAdmin() || isKitchenStatusUpdate();
  allow delete: if isAdmin();
}

match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();
}

match /categories/{categoryId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

The exact production rules should be finalized after deciding how customer order ownership is tracked. Options include:

- Anonymous Firebase Auth.
- Customer session token saved with the order.
- Order lookup token.
- Phone number plus verification.

## 6. Risk Reminder

Never use this in production:

```js
allow read, write: if true;
```

Risks of open rules:

- Anyone can read all customer orders.
- Anyone can create fake orders.
- Anyone can cancel or complete orders.
- Anyone can change product or category data.
- Customer notes and table information may be exposed.

Before launch, rules must be restricted and tested with Firebase Rules Simulator or local emulator tests.
