# Mobile Requests API Documentation

This document provides comprehensive API documentation for the Stock and Money request features in the mobile application.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Stock Requests API](#stock-requests-api)
4. [Money Requests API](#money-requests-api)
5. [TypeScript Types](#typescript-types)
6. [UI Implementation Guide](#ui-implementation-guide)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Overview

Employees can submit two types of requests through the mobile app:

| Request Type      | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| **Stock Request** | Request additional product stock to be assigned to the employee |
| **Money Request** | Submit collected cash or online payments back to admin          |

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header.

```
Authorization: Bearer <token>
```

**Error Response (401)** - If token is missing or invalid:

```json
{
  "success": false,
  "message": "Authorization header is required"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Stock Requests API

### GET /api/mobile/requests/stock

Fetch all stock requests for the authenticated employee.

**Query Parameters:**

| Parameter | Type   | Required | Description                                                   |
| --------- | ------ | -------- | ------------------------------------------------------------- |
| status    | string | No       | Filter by status: `Pending`, `Approved`, `Rejected`, or `all` |

**Example Request:**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/requests/stock?status=Pending",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

**Success Response (200):**

```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": {
        "_id": "507f1f77bcf86cd799439022",
        "title": "Product Name",
        "photo": "https://example.com/photo.jpg",
        "price": {
          "base": 100,
          "lowestSellingPrice": 80
        }
      },
      "quantity": 5,
      "reason": "Need more stock for upcoming sales event",
      "status": "Pending",
      "rejectionReason": null,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "processedAt": null
    }
  ]
}
```

---

### POST /api/mobile/requests/stock

Create a new stock request.

**Request Body:**

| Field     | Type   | Required | Validation                     |
| --------- | ------ | -------- | ------------------------------ |
| productId | string | Yes      | Must be a valid product ID     |
| quantity  | number | Yes      | Must be >= 1                   |
| reason    | string | Yes      | Must be at least 10 characters |

**Example Request:**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/requests/stock",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: "507f1f77bcf86cd799439022",
      quantity: 10,
      reason: "Need additional stock for retail customers in my area",
    }),
  }
);
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Stock request created successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439033",
    "product": {
      "_id": "507f1f77bcf86cd799439022",
      "title": "Product Name",
      "photo": "https://example.com/photo.jpg",
      "price": {
        "base": 100,
        "lowestSellingPrice": 80
      }
    },
    "quantity": 10,
    "reason": "Need additional stock for retail customers in my area",
    "status": "Pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                                 | When                       |
| ------ | --------------------------------------- | -------------------------- |
| 400    | "Product is required"                   | productId is missing       |
| 400    | "Quantity must be at least 1"           | quantity is 0 or negative  |
| 400    | "Reason is required"                    | reason is empty            |
| 400    | "Reason must be at least 10 characters" | reason is too short        |
| 400    | "This product is currently inactive"    | Product status is Inactive |
| 404    | "Product not found"                     | Invalid productId          |

---

## Money Requests API

### GET /api/mobile/requests/money

Fetch all money requests for the authenticated employee.

**Query Parameters:**

| Parameter | Type   | Required | Description                                                   |
| --------- | ------ | -------- | ------------------------------------------------------------- |
| status    | string | No       | Filter by status: `Pending`, `Approved`, `Rejected`, or `all` |

**Example Request:**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/requests/money?status=all",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

**Success Response (200):**

```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439044",
      "amount": 5000,
      "method": "Cash",
      "referenceNumber": null,
      "status": "Pending",
      "rejectionReason": null,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "processedAt": null
    },
    {
      "_id": "507f1f77bcf86cd799439055",
      "amount": 2500,
      "method": "Online",
      "referenceNumber": "TXN123456789",
      "status": "Approved",
      "rejectionReason": null,
      "createdAt": "2025-01-14T08:00:00.000Z",
      "processedAt": "2025-01-14T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/mobile/requests/money

Create a new money submission request.

**Request Body:**

| Field           | Type   | Required    | Validation                       |
| --------------- | ------ | ----------- | -------------------------------- |
| amount          | number | Yes         | Must be >= 1                     |
| method          | string | Yes         | Must be `"Cash"` or `"Online"`   |
| referenceNumber | string | Conditional | Required if method is `"Online"` |

**Example Request (Cash):**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/requests/money",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 5000,
      method: "Cash",
    }),
  }
);
```

**Example Request (Online):**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/requests/money",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: 2500,
      method: "Online",
      referenceNumber: "TXN123456789",
    }),
  }
);
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Money request created successfully",
  "request": {
    "_id": "507f1f77bcf86cd799439066",
    "amount": 5000,
    "method": "Cash",
    "referenceNumber": null,
    "status": "Pending",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                                            | Extra Fields             | When                                  |
| ------ | -------------------------------------------------- | ------------------------ | ------------------------------------- |
| 400    | "Amount must be at least ₹1"                       | -                        | amount <= 0                           |
| 400    | "Method must be either \"Cash\" or \"Online\""     | -                        | Invalid method                        |
| 400    | "Reference number is required for online payments" | -                        | method=Online without referenceNumber |
| 400    | "Insufficient cash holdings"                       | `available`, `requested` | Cash holdings < amount                |
| 400    | "Insufficient online holdings"                     | `available`, `requested` | Online holdings < amount              |

**Insufficient Holdings Error Example:**

```json
{
  "success": false,
  "message": "Insufficient cash holdings",
  "available": 3000,
  "requested": 5000
}
```

---

## TypeScript Types

```typescript
// ============ Common Types ============

type RequestStatus = "Pending" | "Approved" | "Rejected";
type PaymentMethod = "Cash" | "Online";

interface ProductPrice {
  base: number;
  lowestSellingPrice: number;
}

interface ProductInfo {
  _id: string;
  title: string;
  photo?: string;
  price: ProductPrice;
}

// ============ Stock Request Types ============

interface StockRequest {
  _id: string;
  product: ProductInfo | null;
  quantity: number;
  reason: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

interface CreateStockRequestBody {
  productId: string;
  quantity: number;
  reason: string;
}

interface StockRequestsResponse {
  success: true;
  requests: StockRequest[];
}

interface CreateStockRequestResponse {
  success: true;
  message: string;
  request: StockRequest;
}

// ============ Money Request Types ============

interface MoneyRequest {
  _id: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

interface CreateMoneyRequestBody {
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string; // Required if method is 'Online'
}

interface MoneyRequestsResponse {
  success: true;
  requests: MoneyRequest[];
}

interface CreateMoneyRequestResponse {
  success: true;
  message: string;
  request: MoneyRequest;
}

// ============ Error Types ============

interface ErrorResponse {
  success: false;
  message: string;
}

interface InsufficientHoldingsError extends ErrorResponse {
  available: number;
  requested: number;
}
```

---

## UI Implementation Guide

### Screen Structure

The requests feature should have the following screens:

```
Requests Tab
├── Request List Screen (default)
│   ├── Tab: Stock Requests
│   └── Tab: Money Requests
├── Create Stock Request Screen
└── Create Money Request Screen
```

### Request List Screen

**UI Components:**

1. **Tab Bar** at top: "Stock Requests" | "Money Requests"
2. **Filter Dropdown**: All, Pending, Approved, Rejected
3. **Pull-to-Refresh**: Reload requests list
4. **Empty State**: Show when no requests exist
5. **Request Cards**: Display each request

**Request Card Layout:**

For **Stock Requests**:

```
┌─────────────────────────────────────────────┐
│ [Product Image]  Product Title              │
│                  Quantity: 10               │
│                                             │
│ Reason: Need stock for upcoming event...    │
│                                             │
│ [Status Badge]           Jan 15, 2025 10:30 │
│                                             │
│ ❌ Rejected: Not enough stock available     │ <- Only if rejected
└─────────────────────────────────────────────┘
```

For **Money Requests**:

```
┌─────────────────────────────────────────────┐
│ 💵 ₹5,000                    [Cash Badge]   │
│                                             │
│ Ref: TXN123456789           <- Only if Online
│                                             │
│ [Status Badge]           Jan 15, 2025 10:30 │
│                                             │
│ ❌ Rejected: Invalid reference number       │ <- Only if rejected
└─────────────────────────────────────────────┘
```

**Status Badge Colors:**

- 🟡 Pending: Yellow/Orange background
- 🟢 Approved: Green background
- 🔴 Rejected: Red background

---

### Create Stock Request Screen

**Form Fields:**

1. **Product Selector** (Required)

   - Use dropdown/picker with product list from `/api/mobile/products`
   - Show product image, title, and available quantity
   - Only show Active products

2. **Quantity Input** (Required)

   - Number input, minimum 1
   - Show stepper buttons (+/-)

3. **Reason Textarea** (Required)

   - Minimum 10 characters
   - Show character count
   - Placeholder: "Explain why you need this stock..."

4. **Submit Button**
   - Disabled until form is valid
   - Show loading state while submitting

**Validation:**

- Show inline validation errors
- Prevent submission until all fields are valid

---

### Create Money Request Screen

**Form Fields:**

1. **Method Selector** (Required)

   - Two large buttons: "Cash" | "Online"
   - Show icon for each (💵 Cash, 💳 Online)

2. **Amount Input** (Required)

   - Number input with currency symbol (₹)
   - Show available holdings for selected method
   - Format: "Available: ₹3,000"

3. **Reference Number** (Conditional)

   - Only visible when "Online" is selected
   - Text input for transaction reference
   - Placeholder: "Enter transaction/UTR number"

4. **Submit Button**
   - Disabled until form is valid
   - Show loading state while submitting

**Visual Feedback:**

- Show holdings balance prominently
- Warn if amount exceeds available holdings (before submit)

---

## Edge Cases & Error Handling

### General Edge Cases

| Scenario           | Handling                                   |
| ------------------ | ------------------------------------------ |
| Network timeout    | Show retry button with error message       |
| Token expired      | Redirect to login screen                   |
| Server error (500) | Show generic error with retry option       |
| Empty request list | Show empty state illustration with message |

### Stock Request Edge Cases

| Scenario                    | API Response                                 | UI Handling                       |
| --------------------------- | -------------------------------------------- | --------------------------------- |
| Product no longer available | 404: "Product not found"                     | Show toast, refresh product list  |
| Product deactivated         | 400: "This product is currently inactive"    | Show toast, refresh product list  |
| Reason too short            | 400: "Reason must be at least 10 characters" | Show inline error under textarea  |
| Duplicate request           | Allow (no duplicate check)                   | User can submit multiple requests |

### Money Request Edge Cases

| Scenario                         | API Response                                               | UI Handling                           |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------- |
| Insufficient Cash                | 400: "Insufficient cash holdings" + available, requested   | Show error with available amount      |
| Insufficient Online              | 400: "Insufficient online holdings" + available, requested | Show error with available amount      |
| Missing reference number         | 400: "Reference number is required for online payments"    | Show inline error under input         |
| Invalid method                   | 400: "Method must be either \"Cash\" or \"Online\""        | Should not happen if UI is correct    |
| Holdings changed after form load | Error when submitting                                      | Refresh holdings, show updated amount |

### Recommended Error Handling Pattern

```typescript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || !data.success) {
    // Handle specific error cases
    if (response.status === 401) {
      // Token expired - redirect to login
      return redirectToLogin();
    }

    if (data.available !== undefined) {
      // Insufficient holdings error
      showError(`Insufficient funds. Available: ₹${data.available}`);
      return;
    }

    // Generic error
    showError(data.message || "Something went wrong");
    return;
  }

  // Success
  showSuccess(data.message);
  navigateBack();
} catch (error) {
  // Network error
  showError("Network error. Please check your connection.");
}
```

### Loading States

1. **List Loading**: Show skeleton cards while fetching
2. **Submit Loading**: Show spinner on button, disable form
3. **Pull-to-Refresh**: Show refresh indicator at top

### Success Feedback

After successful request creation:

1. Show success toast/alert
2. Navigate back to request list
3. New request should appear at top of list
4. Consider haptic feedback on mobile

---

## Best Practices Summary

1. **Always validate on client side** before making API calls
2. **Show loading states** for all async operations
3. **Handle all error responses** gracefully
4. **Refresh data** after successful mutations
5. **Use optimistic UI** where appropriate (show pending request immediately)
6. **Cache request lists** and refresh on focus/pull
7. **Format currency** consistently (₹1,000 format)
8. **Format dates** in user-friendly format (relative or localized)
