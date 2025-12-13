# Mobile Sales API Documentation

This document provides comprehensive API documentation for the Sales feature in the mobile application.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Sales API](#sales-api)
4. [TypeScript Types](#typescript-types)
5. [UI Implementation Guide](#ui-implementation-guide)
6. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Overview

Employees can record sales of their assigned products to customers. Each sale:

- Deducts product quantities from the employee's assigned stock
- Adds the sale amount to employee's holdings (cash or online)
- Records customer information for reference

---

## Authentication

All endpoints require JWT authentication via the `Authorization` header.

```
Authorization: Bearer <token>
```

---

## Sales API

### GET /api/mobile/sales

Fetch all sales for the authenticated employee with pagination and optional filters.

**Query Parameters:**

| Parameter     | Type   | Default | Description                                |
| ------------- | ------ | ------- | ------------------------------------------ |
| page          | number | 1       | Page number for pagination                 |
| limit         | number | 20      | Number of records per page                 |
| paymentMethod | string | -       | Filter by payment method: `Cash`, `Online` |
| productId     | string | -       | Filter sales containing this product       |

**Example Request:**

```typescript
// Basic request with pagination
const response = await fetch(
  "https://your-domain.com/api/mobile/sales?page=1&limit=10",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

// With filters
const filteredResponse = await fetch(
  "https://your-domain.com/api/mobile/sales?paymentMethod=Cash&productId=507f1f77bcf86cd799439022",
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
  "sales": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439022",
          "productTitle": "Product Name",
          "productPhoto": "https://example.com/photo.jpg",
          "quantity": 2,
          "pricePerUnit": 500,
          "totalPrice": 1000
        }
      ],
      "customer": {
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john@example.com",
        "address": "123 Main Street"
      },
      "paymentMethod": "Cash",
      "totalAmount": 1000,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### GET /api/mobile/sales/filters

Get available filter options for the sales list (products sold by this employee, payment method breakdown).

**Example Request:**

```typescript
const response = await fetch(
  "https://your-domain.com/api/mobile/sales/filters",
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
  "filters": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439022",
        "title": "Premium Widget",
        "photo": "https://example.com/photo.jpg",
        "salesCount": 15
      },
      {
        "_id": "507f1f77bcf86cd799439033",
        "title": "Basic Widget",
        "photo": null,
        "salesCount": 8
      }
    ],
    "paymentMethods": [
      {
        "method": "Cash",
        "count": 20,
        "totalAmount": 50000
      },
      {
        "method": "Online",
        "count": 10,
        "totalAmount": 25000
      }
    ]
  }
}
```

---

### POST /api/mobile/sales

Create a new sale.

**Request Body:**

| Field         | Type       | Required | Description               |
| ------------- | ---------- | -------- | ------------------------- |
| items         | SaleItem[] | Yes      | Array of items being sold |
| customer      | Customer   | Yes      | Customer information      |
| paymentMethod | string     | Yes      | `"Cash"` or `"Online"`    |

**SaleItem Object:**

| Field        | Type   | Required | Description                                   |
| ------------ | ------ | -------- | --------------------------------------------- |
| productId    | string | Yes      | Product ID from employee's assigned products  |
| productTitle | string | Yes      | Product name (for record keeping)             |
| quantity     | number | Yes      | Quantity to sell (must have sufficient stock) |
| pricePerUnit | number | Yes      | Selling price per unit                        |

**Customer Object:**

| Field   | Type   | Required | Description           |
| ------- | ------ | -------- | --------------------- |
| name    | string | Yes      | Customer's name       |
| phone   | string | Yes      | 10-digit phone number |
| email   | string | No       | Customer's email      |
| address | string | No       | Customer's address    |

**Example Request:**

```typescript
const response = await fetch("https://your-domain.com/api/mobile/sales", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    items: [
      {
        productId: "507f1f77bcf86cd799439022",
        productTitle: "Premium Widget",
        quantity: 2,
        pricePerUnit: 500,
      },
    ],
    customer: {
      name: "John Doe",
      phone: "9876543210",
      email: "john@example.com",
      address: "123 Main Street, City",
    },
    paymentMethod: "Cash",
  }),
});
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Sale recorded successfully",
  "sale": {
    "_id": "507f1f77bcf86cd799439033",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439022",
        "productTitle": "Premium Widget",
        "quantity": 2,
        "pricePerUnit": 500,
        "totalPrice": 1000
      }
    ],
    "customer": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "address": "123 Main Street, City"
    },
    "paymentMethod": "Cash",
    "totalAmount": 1000,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "updatedHoldings": {
    "cash": 5000,
    "online": 2000,
    "total": 7000
  }
}
```

**Error Responses:**

| Status | Message                                         | When                            |
| ------ | ----------------------------------------------- | ------------------------------- |
| 400    | "At least one item is required"                 | Empty items array               |
| 400    | "Item N: Product is required"                   | Missing productId               |
| 400    | "Item N: Quantity must be at least 1"           | Invalid quantity                |
| 400    | "Customer name is required"                     | Missing customer name           |
| 400    | "Customer phone is required"                    | Missing phone                   |
| 400    | "Please enter a valid 10-digit phone number"    | Invalid phone format            |
| 400    | "Payment method must be \"Cash\" or \"Online\"" | Invalid payment method          |
| 400    | "You don't have these products assigned"        | Product not in employee's stock |
| 400    | "Insufficient stock for: ..."                   | Not enough quantity             |

**Insufficient Stock Error Example:**

```json
{
  "success": false,
  "message": "Insufficient stock for: Premium Widget: need 5, have 2",
  "insufficientItems": ["Premium Widget: need 5, have 2"]
}
```

---

## TypeScript Types

```typescript
// ============ Common Types ============

type PaymentMethod = "Cash" | "Online";

// ============ Sale Item Types ============

interface SaleItemInput {
  productId: string;
  productTitle: string;
  quantity: number;
  pricePerUnit: number;
}

interface SaleItem {
  productId: string | null;
  productTitle: string;
  productPhoto: string | null;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

// ============ Customer Types ============

interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

// ============ Sale Types ============

interface Sale {
  _id: string;
  items: SaleItem[];
  customer: Customer;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
}

interface CreateSaleBody {
  items: SaleItemInput[];
  customer: CustomerInput;
  paymentMethod: PaymentMethod;
}

// ============ Filter Types ============

interface ProductFilterOption {
  _id: string;
  title: string;
  photo?: string;
  salesCount: number;
}

interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  totalAmount: number;
}

interface SalesFilters {
  products: ProductFilterOption[];
  paymentMethods: PaymentMethodBreakdown[];
}

interface SalesFiltersResponse {
  success: true;
  filters: SalesFilters;
}

// ============ Response Types ============

interface Holdings {
  cash: number;
  online: number;
  total: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

interface SalesListResponse {
  success: true;
  sales: Sale[];
  pagination: PaginationInfo;
}

interface CreateSaleResponse {
  success: true;
  message: string;
  sale: Sale;
  updatedHoldings: Holdings;
}

interface ErrorResponse {
  success: false;
  message: string;
  missingItems?: string[];
  insufficientItems?: string[];
}
```

---

## UI Implementation Guide

### Screen Structure

```
Sales Tab
├── Sales List Screen (default)
│   ├── Sales history with pagination
│   └── Pull-to-refresh
├── Create Sale Screen
│   ├── Product Selection (multi-select from assigned products)
│   ├── Customer Information Form
│   └── Payment Method Selection
└── Sale Detail Screen (optional)
```

### Sales List Screen

**UI Components:**

1. **Summary Card** at top showing:

   - Total sales count
   - Today's earnings
   - Cash vs Online breakdown

2. **Sales List** with infinite scroll/pagination

3. **Empty State** when no sales

4. **Filter Bar** with:
   - Payment method filter (All / Cash / Online)
   - Product filter dropdown (from `/api/mobile/sales/filters`)

**Sale Card Layout:**

```
┌─────────────────────────────────────────────┐
│ ₹1,000                        [Cash Badge]  │
│                                             │
│ 2 items • John Doe                          │
│ Premium Widget ×2                           │
│                                             │
│ Jan 15, 2025 • 10:30 AM                     │
└─────────────────────────────────────────────┘
```

---

### Create Sale Screen

The sale creation follows a multi-step or single-page form:

**Step 1: Product Selection**

```
┌─────────────────────────────────────────────┐
│ Select Products                             │
├─────────────────────────────────────────────┤
│ [Product Image] Premium Widget              │
│ Available: 10      Price: ₹500              │
│                                             │
│ Quantity: [ - ] 2 [ + ]                     │
│ Selling Price: ₹500                         │
│ Subtotal: ₹1,000                            │
├─────────────────────────────────────────────┤
│ [Add another product +]                     │
├─────────────────────────────────────────────┤
│ Cart Total: ₹1,000                          │
└─────────────────────────────────────────────┘
```

**Key Features:**

- Show only products assigned to employee (from `/api/mobile/products`)
- Show available quantity for each product
- Allow adjusting selling price (with minimum price warning)
- Calculate and show subtotals

**Step 2: Customer Information**

```
┌─────────────────────────────────────────────┐
│ Customer Details                            │
├─────────────────────────────────────────────┤
│ Name *                                      │
│ [________________________]                  │
│                                             │
│ Phone *                                     │
│ [________________________]                  │
│                                             │
│ Email (optional)                            │
│ [________________________]                  │
│                                             │
│ Address (optional)                          │
│ [________________________]                  │
│ [________________________]                  │
└─────────────────────────────────────────────┘
```

**Step 3: Payment Method**

```
┌─────────────────────────────────────────────┐
│ Payment Method                              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐    ┌─────────────┐         │
│  │   💵        │    │   💳        │         │
│  │   Cash      │    │   Online    │         │
│  └─────────────┘    └─────────────┘         │
│                                             │
├─────────────────────────────────────────────┤
│ Total Amount: ₹1,000                        │
│                                             │
│ [    Complete Sale    ]                     │
└─────────────────────────────────────────────┘
```

---

### Success Flow

After successful sale:

1. **Show Success Screen** with:

   - Checkmark animation
   - Sale amount
   - Updated holdings

2. **Options:**
   - "View Sales" → Navigate to sales list
   - "New Sale" → Reset form for next sale

---

## Edge Cases & Error Handling

### Product Selection Edge Cases

| Scenario                    | Handling                                       |
| --------------------------- | ---------------------------------------------- |
| No products assigned        | Show empty state with message to request stock |
| Product stock depleted      | Remove from selection, show "Out of stock"     |
| Quantity exceeds stock      | Show error, limit quantity to available        |
| Selling below minimum price | Show warning (not blocking)                    |

### Customer Input Edge Cases

| Scenario                   | Handling                             |
| -------------------------- | ------------------------------------ |
| Invalid phone format       | Show inline error, require 10 digits |
| Special characters in name | Allow, but trim whitespace           |
| Empty required fields      | Show inline validation errors        |

### Submission Edge Cases

| Scenario                        | API Response              | UI Handling                  |
| ------------------------------- | ------------------------- | ---------------------------- |
| Stock changed (concurrent sale) | 400: "Insufficient stock" | Show error, refresh products |
| Product unassigned mid-form     | 400: "You don't have..."  | Show error, refresh products |
| Network timeout                 | Connection error          | Show retry button            |
| Session expired                 | 401                       | Redirect to login            |

### Error Handling Pattern

```typescript
async function createSale(saleData: CreateSaleBody) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saleData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        return redirectToLogin();
      }

      if (data.insufficientItems) {
        // Specific handling for stock issues
        showError(`Stock issue: ${data.insufficientItems.join(", ")}`);
        refreshProducts(); // Update local product list
        return;
      }

      if (data.missingItems) {
        // Products no longer assigned
        showError(`Products unavailable: ${data.missingItems.join(", ")}`);
        refreshProducts();
        return;
      }

      showError(data.message || "Failed to create sale");
      return;
    }

    // Success!
    showSuccess(`Sale of ₹${data.sale.totalAmount} recorded!`);
    updateLocalHoldings(data.updatedHoldings);
    navigateToSalesList();
  } catch (error) {
    showError("Network error. Please check connection.");
  }
}
```

---

## Best Practices

1. **Validate locally before API call** - Check required fields, quantities
2. **Show real-time totals** - Update cart total as items are added
3. **Confirm before submission** - Show summary before final submit
4. **Optimistic UI** - Show new sale in list immediately
5. **Sync holdings** - Update displayed holdings after successful sale
6. **Haptic feedback** - On successful sale completion
7. **Receipt option** - Consider ability to share/print receipt

---

## Related APIs

| API                          | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `/api/mobile/products`       | Get employee's assigned products for sale selection |
| `/api/mobile/profile`        | Get employee profile including current holdings     |
| `/api/mobile/requests/stock` | Request more stock when running low                 |
| `/api/mobile/sales/filters`  | Get filter options for sales list                   |
