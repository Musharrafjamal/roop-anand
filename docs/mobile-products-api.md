# Mobile Products API Documentation

## Get Employee Products

Fetches all products assigned to the authenticated employee.

### Endpoint

```
GET /api/mobile/products
```

### Headers

| Header        | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | Bearer `<token>` | Yes      |

### Example Request

```typescript
const response = await fetch("https://your-domain.com/api/mobile/products", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${userToken}`,
  },
});

const data = await response.json();
```

### Success Response (200)

```json
{
  "success": true,
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Product Name",
      "description": "Product description text",
      "photo": "https://example.com/photo.jpg",
      "price": {
        "base": 100,
        "lowestSellingPrice": 80
      },
      "status": "Active",
      "stockQuantity": 50,
      "assignedQuantity": 10,
      "assignedAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

### Error Responses

**401 Unauthorized** - Missing or invalid token:

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

**404 Not Found** - User not found:

```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error**:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## TypeScript Types

```typescript
interface ProductPrice {
  base: number;
  lowestSellingPrice: number;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  photo?: string;
  price: ProductPrice;
  status: "Active" | "Inactive";
  stockQuantity: number;
  assignedQuantity: number;
  assignedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface ProductsResponse {
  success: true;
  products: Product[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

type GetProductsResponse = ProductsResponse | ErrorResponse;
```
