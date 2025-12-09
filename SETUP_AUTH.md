# Admin Authentication Setup Guide (NextAuth.js)

This guide walks you through setting up the admin authentication system using NextAuth.js.

## Prerequisites

- MongoDB running locally or a MongoDB Atlas connection string
- Node.js 18+ or Bun
- SMTP credentials for password reset emails (optional)

## 1. Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/employee-stock-mgmt

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters-long

# Initial Admin Credentials (used for auto-seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Email Configuration (optional, for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Employee Stock System <noreply@example.com>"

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important:** Generate a secure `NEXTAUTH_SECRET` using:
>
> ```bash
> openssl rand -base64 32
> ```

## 2. Install Dependencies

Dependencies should already be installed. If not:

```bash
bun install
```

## 3. Start the Development Server

```bash
bun dev
```

## 4. Test Authentication

### Login Flow

1. Navigate to `http://localhost:3000/admin/login`
2. Enter the admin email from your `.env` file (e.g., `admin@example.com`)
3. Enter the password (e.g., `admin123`)
4. Click **Login**
5. You should be redirected to `/admin/dashboard`

### Route Protection

| Route                    | Protected | Description                      |
| ------------------------ | --------- | -------------------------------- |
| `/admin/login`           | ❌ No     | Public login page                |
| `/admin/forgot-password` | ❌ No     | Public password reset request    |
| `/admin/reset-password`  | ❌ No     | Public password reset form       |
| `/admin/dashboard`       | ✅ Yes    | Protected admin dashboard        |
| `/admin/*` (any other)   | ✅ Yes    | All other admin routes protected |

### Test Protection

1. **Without Login:** Visit `http://localhost:3000/admin/dashboard`

   - You should be redirected to `/admin/login`

2. **After Login:** You can access `/admin/dashboard`

   - Protected content is visible

3. **Logout:** Click the logout button
   - You're redirected to `/admin/login`
   - `/admin/dashboard` is no longer accessible

## Auto-Seeding

The system automatically creates an admin user on first login attempt using the credentials from your `.env` file:

- `ADMIN_EMAIL`: The admin's email address
- `ADMIN_PASSWORD`: The admin's password (will be hashed)

## Files Overview

```
app/
├── admin/
│   ├── login/page.tsx          # Login page (public)
│   ├── forgot-password/page.tsx # Forgot password (public)
│   ├── reset-password/page.tsx  # Reset password (public)
│   └── dashboard/page.tsx       # Dashboard (protected)
├── api/
│   └── auth/
│       └── [...nextauth]/route.ts # NextAuth API handler
├── providers.tsx                # NextAuth SessionProvider
└── layout.tsx                   # Root layout

lib/
├── auth.ts                      # Password hashing utilities
├── mongodb.ts                   # MongoDB connection
├── email.ts                     # Email service
└── seedAdmin.ts                 # Admin seeding

models/
└── Admin.ts                     # Admin Mongoose model

middleware.ts                    # Route protection
types/
└── next-auth.d.ts               # NextAuth type extensions
```

## Troubleshooting

### "NEXTAUTH_SECRET is not set"

Add `NEXTAUTH_SECRET` to your `.env` file with a secure random string.

### "Invalid email or password"

1. Check if your `.env` has the correct `ADMIN_EMAIL` and `ADMIN_PASSWORD`
2. If you changed credentials, delete the admin from MongoDB and try again

### Session not persisting

Make sure `NEXTAUTH_URL` is set to your app URL (e.g., `http://localhost:3000`)

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based sessions via NextAuth.js
- ✅ Automatic token refresh
- ✅ CSRF protection built-in
- ✅ Secure cookie handling
- ✅ Route protection via middleware
