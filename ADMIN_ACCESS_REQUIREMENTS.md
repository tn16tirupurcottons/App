# Admin Dashboard Access Requirements

## Overview
This document explains what access and permissions are required to use the Admin Dashboard without changing any code.

## Required Access & Permissions

### 1. Database Access
- **PostgreSQL Database**: Full read/write access to the `ecommerce` database
- **Required Tables**:
  - `Users` - To verify admin role
  - `BrandSettings` - To save theme and branding settings
  - `Banners` - To manage banners
  - `Products`, `Categories`, `Orders`, `OrderItems` - For content management

### 2. Cloudinary Account
- **Purpose**: Image uploads for banners, logos, and product images
- **Required**:
  - Cloudinary account with API credentials
  - Environment variables:
    - `CLOUDINARY_CLOUD_NAME`
    - `CLOUDINARY_API_KEY`
    - `CLOUDINARY_API_SECRET`
  - Upload preset configured (optional, but recommended)

### 3. User Account with Admin Role
- **How to Create Admin User**:
  1. Run the bootstrap script: `node scripts/createAdmin.js`
  2. Or manually set a user's role to `"admin"` in the database:
     ```sql
     UPDATE "Users" SET role = 'admin' WHERE email = 'your-email@example.com';
     ```
- **Login Requirements**:
  - Email or mobile number (if mobile number is set)
  - Password
  - Must have `role = 'admin'` in the database

### 4. Environment Variables
The following environment variables must be set in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# JWT Secrets
JWT_ACCESS_SECRET=your-strong-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-strong-refresh-secret-min-32-chars

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS (frontend URL)
CLIENT_URL=http://localhost:5173

# Optional: Email/WhatsApp notifications
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 5. Frontend Access
- **URL**: `http://localhost:5173/admin` (or your production URL)
- **Authentication**: Must be logged in as an admin user
- **Route Protection**: 
  - Frontend: `ProtectedRoute` with `adminOnly` prop
  - Backend: `protect` + `admin` middleware

## Admin Dashboard Features & Access

### ✅ Available Features (No Code Changes Needed)

1. **Brand Settings** (`/admin/brand-settings`)
   - Upload logos, favicon, footer logo
   - Upload hero background images
   - Change theme colors (primary, secondary, accent, background, text, header, footer)
   - Change fonts (heading, body)
   - Change container radius
   - **Access Required**: Admin role + Cloudinary credentials

2. **Banner Management** (`/admin/banners`)
   - Create/edit banners
   - Upload up to 5 images per banner
   - Set page and position (home/hero, catalog/top, etc.)
   - Set display order
   - **Access Required**: Admin role + Cloudinary credentials

3. **Product Management** (`/admin/products`)
   - Create/edit products
   - Upload product images
   - Set prices, descriptions, categories
   - **Access Required**: Admin role + Cloudinary credentials

4. **Order Management** (`/admin/orders`)
   - View all orders
   - Update order status
   - View order details
   - **Access Required**: Admin role

5. **Category Management** (`/admin/categories`)
   - Create/edit categories
   - Upload category images
   - **Access Required**: Admin role + Cloudinary credentials

## How to Grant Admin Access

### Method 1: Using the Bootstrap Script (Recommended)
```bash
cd ecommerce-backend
node scripts/createAdmin.js
```
This will prompt for:
- Email
- Password
- Mobile number (optional)
- Name

### Method 2: Direct Database Update
```sql
-- Set existing user as admin
UPDATE "Users" SET role = 'admin' WHERE email = 'admin@example.com';

-- Or create new admin user directly
INSERT INTO "Users" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@example.com',
  '$2b$10$hashedpasswordhere', -- Use bcrypt to hash password
  'admin',
  NOW(),
  NOW()
);
```

### Method 3: Using Sequelize Console
```bash
cd ecommerce-backend
node -e "
import User from './models/User.js';
import sequelize from './config/db.js';
await sequelize.authenticate();
const user = await User.findOne({ where: { email: 'your-email@example.com' } });
if (user) {
  user.role = 'admin';
  await user.save();
  console.log('Admin access granted!');
} else {
  console.log('User not found');
}
process.exit(0);
"
```

## Security Notes

1. **Role Check**: The backend enforces admin role via `admin` middleware
2. **Token Validation**: JWT tokens are validated on every request
3. **No Public Admin Routes**: All admin routes require authentication
4. **Frontend Protection**: Admin links only visible to logged-in admins

## Troubleshooting

### "Admin access only" Error
- **Cause**: User role is not set to `"admin"` in database
- **Fix**: Update user role in database (see Method 2 above)

### "No token provided" Error
- **Cause**: Not logged in or token expired
- **Fix**: Log in again at `/login`

### Image Upload Fails
- **Cause**: Cloudinary credentials missing or invalid
- **Fix**: Check `.env` file has correct `CLOUDINARY_*` variables

### Cannot Access Admin Dashboard
- **Cause**: Frontend route protection or backend middleware blocking
- **Fix**: 
  1. Ensure you're logged in
  2. Ensure your user has `role = 'admin'` in database
  3. Check browser console for errors
  4. Check backend logs for authentication errors

## Summary

**To use the Admin Dashboard, you need:**
1. ✅ A user account with `role = 'admin'` in the database
2. ✅ Valid JWT tokens (obtained by logging in)
3. ✅ Cloudinary credentials (for image uploads)
4. ✅ Database access (for reading/writing settings)

**No code changes are required** - all access is controlled via:
- Database user role field
- Environment variables
- JWT authentication tokens

