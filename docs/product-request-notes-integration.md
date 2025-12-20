# Product Request Notes Thread - Mobile Integration Guide

This document explains how to integrate the **Notes Thread** feature for product requests in the mobile app. This allows customers to communicate with admins through a chat-style thread on their product requests.

## Overview

Each product request now has a `notes` array that works like a conversation thread. Both customers and admins can add messages, with each note containing:

| Field       | Type                      | Description               |
| ----------- | ------------------------- | ------------------------- |
| `by`        | `"admin"` \| `"customer"` | Who sent the note         |
| `content`   | `string`                  | The message content       |
| `createdAt` | `ISO Date`                | When the note was created |

---

## API Endpoints

### 1. Get Notes for a Request

```
GET /api/mobile/customer/requests/{requestId}/notes
```

**Headers:**

```
Authorization: Bearer <customer_token>
```

**Response:**

```json
{
  "success": true,
  "notes": [
    {
      "by": "customer",
      "content": "Can I get this in blue?",
      "createdAt": "2024-12-20T10:30:00.000Z"
    },
    {
      "by": "admin",
      "content": "Yes, blue is available!",
      "createdAt": "2024-12-20T11:15:00.000Z"
    }
  ]
}
```

---

### 2. Add a Note

```
POST /api/mobile/customer/requests/{requestId}/notes
```

**Headers:**

```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Body:**

```json
{
  "content": "Your message here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Note added successfully",
  "note": {
    "by": "customer",
    "content": "Your message here",
    "createdAt": "2024-12-20T14:00:00.000Z"
  },
  "notes": [
    /* full notes array */
  ]
}
```

---

## UI Implementation Tips

1. **Display as Chat**: Show notes as a chat thread with customer messages on one side and admin messages on the other

2. **Sort by Date**: Notes are stored in chronological order (oldest first)

3. **Input Field**: Add a text input at the bottom of the request details screen for sending new messages

4. **Refresh**: Call GET endpoint when viewing request details to load latest notes

5. **Empty State**: Show a helpful message when no notes exist yet (e.g., "Have a question? Send a message!")
