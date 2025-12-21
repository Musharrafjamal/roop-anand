# Employee Dashboard API Documentation

Complete API reference for building the employee mobile application dashboard.

---

## Base URL

```
/api/mobile
```

---

## Authentication

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Dashboard Endpoint

### GET `/dashboard`

Returns comprehensive dashboard data for the authenticated employee including holdings, stock summary, sales insights, and request status.

#### Query Parameters

| Parameter | Type   | Required | Default | Description                                                                         |
| --------- | ------ | -------- | ------- | ----------------------------------------------------------------------------------- |
| `period`  | string | No       | `today` | Time period filter. Valid values: `today`, `week`, `month`, `lastMonth`, `lifetime` |

#### Example Request

```
GET /api/mobile/dashboard?period=today
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Response Structure

```json
{
  "success": true,
  "period": "today",
  "dateRange": {
    "from": "2025-12-22T00:00:00.000Z",
    "to": "2025-12-22T23:59:59.999Z"
  },
  "employee": { ... },
  "holdings": { ... },
  "stockSummary": { ... },
  "salesInsights": { ... },
  "moneyDepositInsights": { ... },
  "stockRequestInsights": { ... },
  "recentActivity": { ... }
}
```

---

## Response Fields

### 1. Employee Info

Basic information about the logged-in employee.

```json
{
  "employee": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "profilePhoto": "https://example.com/photo.jpg",
    "status": "Online",
    "dateOfJoining": "2024-01-15T00:00:00.000Z"
  }
}
```

| Field           | Type           | Description                   |
| --------------- | -------------- | ----------------------------- |
| `id`            | string         | Employee unique ID            |
| `fullName`      | string         | Employee full name            |
| `profilePhoto`  | string \| null | Profile photo URL             |
| `status`        | string         | `Online` or `Offline`         |
| `dateOfJoining` | string         | ISO date when employee joined |

---

### 2. Holdings

Current money collected by the employee (not yet deposited).

```json
{
  "holdings": {
    "cash": 15000,
    "online": 8500,
    "total": 23500
  }
}
```

| Field    | Type   | Description                   |
| -------- | ------ | ----------------------------- |
| `cash`   | number | Cash collected (₹)            |
| `online` | number | Online payments collected (₹) |
| `total`  | number | Total holdings (₹)            |

---

### 3. Stock Summary

Products currently assigned to the employee with quantities and values.

```json
{
  "stockSummary": {
    "totalProducts": 5,
    "totalQuantity": 120,
    "estimatedValue": 45000,
    "products": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "title": "Premium Widget",
        "photo": "https://example.com/widget.jpg",
        "quantity": 25,
        "basePrice": 500,
        "lowestPrice": 450,
        "estimatedValue": 12500
      }
    ]
  }
}
```

| Field            | Type   | Description                     |
| ---------------- | ------ | ------------------------------- |
| `totalProducts`  | number | Number of unique products held  |
| `totalQuantity`  | number | Total units across all products |
| `estimatedValue` | number | Total value at base price (₹)   |
| `products`       | array  | List of products with details   |

**Product Object:**

| Field            | Type           | Description               |
| ---------------- | -------------- | ------------------------- |
| `productId`      | string         | Product unique ID         |
| `title`          | string         | Product name              |
| `photo`          | string \| null | Product image URL         |
| `quantity`       | number         | Units held                |
| `basePrice`      | number         | Base price per unit (₹)   |
| `lowestPrice`    | number         | Minimum selling price (₹) |
| `estimatedValue` | number         | Quantity × Base Price (₹) |

---

### 4. Sales Insights

Sales performance for the selected time period.

```json
{
  "salesInsights": {
    "totalSales": 15,
    "totalRevenue": 75000,
    "avgSaleValue": 5000,
    "totalItemsSold": 45,
    "byPaymentMethod": {
      "cash": {
        "count": 8,
        "revenue": 40000
      },
      "online": {
        "count": 7,
        "revenue": 35000
      }
    },
    "topProducts": [
      {
        "productId": "507f1f77bcf86cd799439012",
        "title": "Premium Widget",
        "quantitySold": 20,
        "revenue": 10000
      }
    ]
  }
}
```

| Field                    | Type   | Description                    |
| ------------------------ | ------ | ------------------------------ |
| `totalSales`             | number | Number of sales transactions   |
| `totalRevenue`           | number | Total revenue generated (₹)    |
| `avgSaleValue`           | number | Average sale amount (₹)        |
| `totalItemsSold`         | number | Total product units sold       |
| `byPaymentMethod.cash`   | object | Cash sales count and revenue   |
| `byPaymentMethod.online` | object | Online sales count and revenue |
| `topProducts`            | array  | Top 5 best-selling products    |

---

### 5. Money Deposit Insights

Status of money deposit requests for the selected period.

```json
{
  "moneyDepositInsights": {
    "total": {
      "count": 5,
      "amount": 50000
    },
    "byStatus": {
      "pending": { "count": 2, "amount": 20000 },
      "approved": { "count": 2, "amount": 25000 },
      "rejected": { "count": 1, "amount": 5000 }
    }
  }
}
```

| Field               | Type   | Description                |
| ------------------- | ------ | -------------------------- |
| `total.count`       | number | Total requests made        |
| `total.amount`      | number | Total amount requested (₹) |
| `byStatus.pending`  | object | Pending requests stats     |
| `byStatus.approved` | object | Approved requests stats    |
| `byStatus.rejected` | object | Rejected requests stats    |

---

### 6. Stock Request Insights

Status of stock/product requests for the selected period.

```json
{
  "stockRequestInsights": {
    "total": {
      "count": 8,
      "quantity": 100
    },
    "byStatus": {
      "pending": { "count": 3, "quantity": 30 },
      "approved": { "count": 4, "quantity": 60 },
      "rejected": { "count": 1, "quantity": 10 }
    }
  }
}
```

| Field               | Type   | Description                   |
| ------------------- | ------ | ----------------------------- |
| `total.count`       | number | Total requests made           |
| `total.quantity`    | number | Total product units requested |
| `byStatus.pending`  | object | Pending requests stats        |
| `byStatus.approved` | object | Approved requests stats       |
| `byStatus.rejected` | object | Rejected requests stats       |

---

### 7. Recent Activity

Latest transactions across all categories (always shows most recent, not filtered by period).

```json
{
  "recentActivity": {
    "sales": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 5000,
        "paymentMethod": "Cash",
        "customerName": "Jane Doe",
        "createdAt": "2025-12-22T10:30:00.000Z"
      }
    ],
    "moneyRequests": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "amount": 10000,
        "method": "Cash",
        "status": "Pending",
        "createdAt": "2025-12-22T09:15:00.000Z"
      }
    ],
    "stockRequests": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "productTitle": "Premium Widget",
        "quantity": 10,
        "status": "Approved",
        "createdAt": "2025-12-21T16:45:00.000Z"
      }
    ]
  }
}
```

Each category returns the 5 most recent items.

---

## Time Period Definitions

| Period      | Date Range                     |
| ----------- | ------------------------------ |
| `today`     | Midnight to end of current day |
| `week`      | Sunday of current week to now  |
| `month`     | 1st of current month to now    |
| `lastMonth` | Entire previous month          |
| `lifetime`  | All time (no date filter)      |

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid period. Valid values: today, week, month, lastMonth, lifetime"
}
```

### 401 Unauthorized

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

### 404 Not Found

```json
{
  "success": false,
  "message": "Employee not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APPLICATION                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ GET /api/mobile/dashboard?period=today
                                    │ Authorization: Bearer <token>
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINT                                 │
│  /api/mobile/dashboard                                               │
│                                                                      │
│  1. Verify JWT Token                                                 │
│  2. Parse period parameter                                           │
│  3. Calculate date range                                             │
│  4. Query all data sources in parallel                               │
└─────────────────────────────────────────────────────────────────────┘
         │              │              │               │
         ▼              ▼              ▼               ▼
    ┌─────────┐   ┌─────────┐   ┌───────────┐   ┌────────────┐
    │Employee │   │  Sales  │   │   Money   │   │   Stock    │
    │   DB    │   │   DB    │   │ Requests  │   │  Requests  │
    │         │   │         │   │    DB     │   │     DB     │
    └─────────┘   └─────────┘   └───────────┘   └────────────┘
         │              │              │               │
         └──────────────┴──────────────┴───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │     AGGREGATED RESPONSE    │
                    │                           │
                    │  • Employee Info          │
                    │  • Holdings               │
                    │  • Stock Summary          │
                    │  • Sales Insights         │
                    │  • Money Request Stats    │
                    │  • Stock Request Stats    │
                    │  • Recent Activity        │
                    └───────────────────────────┘
```

---

## UI Component Mapping

| Section         | Data Source                                    | UI Suggestion                       |
| --------------- | ---------------------------------------------- | ----------------------------------- |
| Profile Header  | `employee`                                     | Avatar, name, status badge          |
| Holdings Card   | `holdings`                                     | 3-column split: Cash, Online, Total |
| Stock Summary   | `stockSummary`                                 | Product grid with quantities        |
| Sales Chart     | `salesInsights`                                | Bar/pie chart, stats cards          |
| Request Status  | `moneyDepositInsights`, `stockRequestInsights` | Status badges with counts           |
| Activity Feed   | `recentActivity`                               | Timeline/list view                  |
| Period Selector | `period` query param                           | Tab bar or dropdown                 |

---

## Best Practices

1. **Caching**: Cache dashboard response briefly (30-60 seconds) to reduce API calls
2. **Period Selector**: Place prominently so users can easily switch views
3. **Pull to Refresh**: Implement for real-time updates
4. **Loading States**: Show skeleton loaders for each section
5. **Empty States**: Handle zero values gracefully with encouraging messages
6. **Offline Support**: Cache last successful response for offline viewing
