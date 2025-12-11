# Mobile Authentication API Documentation

This document provides API documentation for the mobile application authentication endpoints.

## Base URL

```
http://localhost:3030/api/mobile
```

> **Production:** Replace with your production URL

---

## Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "email": "john@example.com",
    "profilePhoto": "https://...",
    "status": "Online"
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

**Usage Example (React Native with fetch):**

```javascript
const login = async (email, password) => {
  const response = await fetch("http://localhost:3030/api/mobile/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Store the token securely (e.g., AsyncStorage)
    await AsyncStorage.setItem("authToken", data.token);
    return data.user;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 2. Forgot Password (Request OTP)

Request a password reset OTP to be sent to the user's email.

**Endpoint:** `POST /auth/forgot-password`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "If your email is registered, you will receive an OTP"
}
```

> **Note:** For security, this endpoint returns success even if the email doesn't exist.

**Usage Example:**

```javascript
const requestOTP = async (email) => {
  const response = await fetch(
    "http://localhost:3030/api/mobile/auth/forgot-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();
  return data;
};
```

---

### 3. Verify OTP

Verify the OTP received via email and get a temporary reset token.

**Endpoint:** `POST /auth/verify-otp`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

OTP Expired (400):

```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

Invalid OTP (400):

```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Usage Example:**

```javascript
const verifyOTP = async (email, otp) => {
  const response = await fetch(
    "http://localhost:3030/api/mobile/auth/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    }
  );

  const data = await response.json();

  if (data.success) {
    // Store resetToken temporarily for the next step
    return data.resetToken;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 4. Reset Password

Reset the password using the temporary reset token from OTP verification.

**Endpoint:** `POST /auth/reset-password`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

Invalid/Expired Token (400):

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

Password Too Short (400):

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

**Usage Example:**

```javascript
const resetPassword = async (resetToken, newPassword) => {
  const response = await fetch(
    "http://localhost:3030/api/mobile/auth/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resetToken, newPassword }),
    }
  );

  const data = await response.json();

  if (data.success) {
    // Navigate to login screen
    return true;
  } else {
    throw new Error(data.message);
  }
};
```

---

### 5. Get Profile (Protected Route Example)

Fetch the current user's profile. **Requires authentication.**

**Endpoint:** `GET /profile`

**Headers:**

```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "email": "john@example.com",
    "gender": "Male",
    "age": 30,
    "dateOfJoining": "2024-01-15T00:00:00.000Z",
    "profilePhoto": "https://...",
    "status": "Online",
    "holdings": {
      "cash": 5000,
      "online": 3000,
      "total": 8000
    },
    "products": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-12-11T15:45:00.000Z"
  }
}
```

**Error Responses:**

Missing Token (401):

```json
{
  "success": false,
  "message": "Authorization header is required"
}
```

Invalid Token (401):

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Usage Example:**

```javascript
const getProfile = async () => {
  const token = await AsyncStorage.getItem("authToken");

  const response = await fetch("http://localhost:3030/api/mobile/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    return data.user;
  } else {
    // Token might be expired, redirect to login
    throw new Error(data.message);
  }
};
```

---

## Password Reset Flow

```
┌─────────────────┐
│  Forgot Password │
│     Screen       │
└────────┬────────┘
         │ POST /auth/forgot-password
         │ { email }
         ▼
┌─────────────────┐
│   OTP Input     │
│     Screen      │
└────────┬────────┘
         │ POST /auth/verify-otp
         │ { email, otp }
         ▼
┌─────────────────┐
│  New Password   │
│     Screen      │
└────────┬────────┘
         │ POST /auth/reset-password
         │ { resetToken, newPassword }
         ▼
┌─────────────────┐
│  Login Screen   │
│   (Success!)    │
└─────────────────┘
```

---

## Creating Protected Routes

To create new protected routes, use the `verifyMobileAuth` middleware:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAuth } from "@/lib/verifyMobileAuth";

export async function GET(request: NextRequest) {
  // Verify JWT token
  const auth = verifyMobileAuth(request);

  if (!auth.success) {
    return auth.response; // Returns 401 error
  }

  // Access authenticated user data
  const { user } = auth;
  console.log("User ID:", user.id);
  console.log("Full Name:", user.fullName);

  // Your protected logic here...
  return NextResponse.json({
    success: true,
    message: "This is protected data",
  });
}
```

---

## Token Information

- **Auth Token Expiry:** 7 days
- **Reset Token Expiry:** 5 minutes
- **OTP Expiry:** 10 minutes

---

## Error Handling Best Practices

```javascript
// Create an API utility function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!data.success) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired, clear storage and redirect to login
        await AsyncStorage.removeItem("authToken");
        // Navigate to login
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

---

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
# JWT Secret (uses NEXTAUTH_SECRET)
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="App Name <noreply@example.com>"
```
