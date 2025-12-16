# Mobile Customer API Documentation

Complete API documentation for the customer-facing mobile application.

## Base URL

```
http://localhost:3030/api/mobile/customer
```

> **Production:** Replace with your production URL

---

## Authentication

### Authentication Types

1. **Guest Login** - Device-based authentication. Customer data is linked to a unique device ID.
   - ✅ Guest accounts **do not expire** - they remain valid indefinitely
   - ⚠️ Data is only lost if the device storage is cleared or app is uninstalled
2. **Registered Login** - Email/password authentication with persistent account.

### JWT Token

After successful authentication, you receive a JWT token. Include it in all protected requests:

- **Guest accounts**: Token valid for **1 year** (auto-refreshes on each login)
- **Registered accounts**: Token valid for **30 days**

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Guest Login

Create or retrieve a guest customer based on device ID.

**Endpoint:** `POST /auth/guest`

**Request Body:**

```json
{
  "deviceId": "unique-device-uuid",
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St, City" // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Guest login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St, City",
    "authType": "guest",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**React Native Example:**

```javascript
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const guestLogin = async (name, phone, address) => {
  // Generate or retrieve device ID
  let deviceId = await AsyncStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = `${Device.modelId}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await AsyncStorage.setItem("deviceId", deviceId);
  }

  const response = await fetch(
    "http://localhost:3030/api/mobile/customer/auth/guest",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, name, phone, address }),
    }
  );

  const data = await response.json();
  if (data.success) {
    await AsyncStorage.setItem("authToken", data.token);
    await AsyncStorage.setItem("customer", JSON.stringify(data.customer));
    return data.customer;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 2. Register

Create a new registered customer account.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St, City" // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St, City",
    "authType": "registered",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                                       |
| ------ | --------------------------------------------- |
| 400    | Email, password, name, and phone are required |
| 400    | Password must be at least 6 characters        |
| 409    | Email is already registered                   |

**React Native Example:**

```javascript
const register = async (email, password, name, phone, address) => {
  const response = await fetch(
    "http://localhost:3030/api/mobile/customer/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone, address }),
    }
  );

  const data = await response.json();
  if (data.success) {
    await AsyncStorage.setItem("authToken", data.token);
    await AsyncStorage.setItem("customer", JSON.stringify(data.customer));
    return data.customer;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 3. Login

Login with email and password.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St, City",
    "authType": "registered",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 4. List Products

Get available products (public endpoint, no auth required).

**Endpoint:** `GET /products`

**Query Parameters:**

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| page      | number | 1       | Page number                 |
| limit     | number | 20      | Items per page              |
| search    | string | -       | Search in title/description |

**Success Response (200):**

```json
{
  "success": true,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "photo": "https://...",
      "title": "Product Name",
      "description": "Product description",
      "price": 999,
      "inStock": true,
      "stockQuantity": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

**React Native Example:**

```javascript
const fetchProducts = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (search) params.append("search", search);

  const response = await fetch(
    `http://localhost:3030/api/mobile/customer/products?${params.toString()}`
  );

  const data = await response.json();
  return data;
};
```

---

### 5. Submit Product Request

Submit a product request (requires authentication).

**Endpoint:** `POST /requests`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "products": [
    { "product": "product_id_1", "quantity": 2 },
    { "product": "product_id_2", "quantity": 1 }
  ],
  "name": "John Doe", // optional, defaults to customer name
  "phone": "1234567890", // optional, defaults to customer phone
  "email": "john@example.com", // optional
  "address": "123 Main St", // optional
  "notes": "Please deliver ASAP" // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Product request submitted successfully",
  "request": {
    "id": "507f1f77bcf86cd799439011",
    "products": [
      {
        "product": {
          "id": "product_id_1",
          "title": "Product Name",
          "photo": "https://..."
        },
        "quantity": 2
      }
    ],
    "status": "pending",
    "customerDetails": {
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "address": "123 Main St"
    },
    "notes": "Please deliver ASAP",
    "createdAt": "2024-12-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message                            |
| ------ | ---------------------------------- |
| 400    | At least one product is required   |
| 400    | Product {id} not found or inactive |
| 401    | Authorization header is required   |
| 401    | Invalid or expired token           |

**React Native Example:**

```javascript
const submitRequest = async (products, customerDetails, notes) => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await fetch(
    "http://localhost:3030/api/mobile/customer/requests",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        products, // [{ product: "id", quantity: 1 }]
        ...customerDetails, // { name, phone, email, address }
        notes,
      }),
    }
  );

  const data = await response.json();
  if (data.success) {
    return data.request;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 6. Get My Requests

Get customer's own product requests (requires authentication).

**Endpoint:** `GET /requests`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**

| Parameter | Type   | Default | Description                         |
| --------- | ------ | ------- | ----------------------------------- |
| page      | number | 1       | Page number                         |
| limit     | number | 20      | Items per page                      |
| status    | string | -       | Filter: pending, ongoing, delivered |

**Success Response (200):**

```json
{
  "success": true,
  "requests": [
    {
      "id": "507f1f77bcf86cd799439011",
      "products": [
        {
          "product": {
            "id": "product_id_1",
            "title": "Product Name",
            "photo": "https://...",
            "price": 999
          },
          "quantity": 2
        }
      ],
      "status": "pending",
      "customerDetails": {
        "name": "John Doe",
        "phone": "1234567890"
      },
      "notes": "Please deliver ASAP",
      "createdAt": "2024-12-15T10:30:00.000Z",
      "updatedAt": "2024-12-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**React Native Example:**

```javascript
const fetchMyRequests = async (page = 1, status = null) => {
  const token = await AsyncStorage.getItem("authToken");
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.append("status", status);

  const response = await fetch(
    `http://localhost:3030/api/mobile/customer/requests?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  } else {
    throw new Error(data.message);
  }
};
```

---

## Request Status Flow

```
┌──────────┐     Admin      ┌──────────┐     Admin      ┌───────────┐
│  PENDING │ ────────────→  │  ONGOING │ ────────────→  │ DELIVERED │
└──────────┘    updates     └──────────┘    updates     └───────────┘
     ↑                           ↑                           ↑
     │                           │                           │
Customer submits          Being processed            Completed
```

---

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP LAUNCH                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check stored     │
                    │ auth token       │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
         Has Token                     No Token
              │                             │
              ▼                             ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Validate token   │          │ Show Auth Screen │
    │ (try API call)   │          └────────┬─────────┘
    └────────┬─────────┘                   │
             │                    ┌────────┴────────┐
     ┌───────┴───────┐            │                 │
     │               │       Guest Login     Email Login
   Valid          Invalid         │                 │
     │               │            ▼                 ▼
     ▼               │   ┌──────────────┐   ┌──────────────┐
┌──────────┐         │   │POST /guest   │   │POST /login   │
│  Home    │         │   └──────────────┘   └──────────────┘
│  Screen  │         │            │                 │
└──────────┘         │            └────────┬────────┘
                     │                     │
                     ▼                     ▼
            ┌──────────────────┐   ┌──────────────────┐
            │ Clear token      │   │ Store token +    │
            │ Show Auth Screen │   │ Go to Home       │
            └──────────────────┘   └──────────────────┘
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Invalid or missing token |
| 404  | Not Found                               |
| 409  | Conflict - Resource already exists      |
| 500  | Internal Server Error                   |

**React Native Error Handler:**

```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success) {
      if (response.status === 401) {
        // Token expired, redirect to login
        await AsyncStorage.removeItem("authToken");
        // Navigate to login screen
      }
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```
