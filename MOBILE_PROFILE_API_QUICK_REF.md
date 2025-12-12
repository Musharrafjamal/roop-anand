# Mobile Profile Update APIs

Base URL: `/api/mobile/profile`

All endpoints require: `Authorization: Bearer <token>`

---

## 1. Update Status

```
PATCH /profile/status
Content-Type: application/json
```

**Request:**
```json
{ "status": "Online" }
```
- `status`: `"Online"` | `"Offline"` (required)

**Response:**
```json
{ "success": true, "message": "Status updated to Online", "user": { "id": "...", "status": "Online" } }
```

---

## 2. Change Password

```
PATCH /profile/password
Content-Type: application/json
```

**Request:**
```json
{ "currentPassword": "old123", "newPassword": "new456" }
```
- `currentPassword`: string (required)
- `newPassword`: string, min 6 chars (required)

**Response:**
```json
{ "success": true, "message": "Password changed successfully" }
```

**Errors:** 400 if same password, 401 if current password wrong

---

## 3. Update Photo

```
PATCH /profile/photo
Content-Type: multipart/form-data
```

> **Note:** Previous photo is automatically deleted from storage when uploading a new one or removing.

**FormData Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `photo` | File | Yes* | Image file (jpeg, png, webp, gif). Max 4MB |
| `action` | string | No | Set to `"remove"` to delete existing photo |

*Required unless `action=remove`

**Request (upload new photo):**
```
FormData:
  - photo: <image_file>
```
→ Automatically deletes previous photo if exists

**Request (remove photo):**
```
FormData:
  - action: "remove"
```
→ Deletes existing photo from storage

**Response (success):**
```json
{ "success": true, "message": "Profile photo updated successfully", "user": { "id": "...", "profilePhoto": "https://utfs.io/f/..." } }
```

**Response (removed):**
```json
{ "success": true, "message": "Profile photo removed successfully", "user": { "id": "...", "profilePhoto": null } }
```

**Errors:**
- 400: `Photo file is required...` (no file and no remove action)
- 400: `Invalid file type. Allowed: jpeg, jpg, png, webp, gif`
- 400: `File too large. Maximum size is 4MB.`

---

## Common Errors

| Status | Message |
|--------|---------|
| 401 | `Authorization header is required` |
| 401 | `Invalid or expired token` |
| 404 | `User not found` |
| 500 | `Internal server error` |
