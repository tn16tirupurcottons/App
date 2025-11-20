# TN16 E-commerce Deployment & Testing Guide

## Critical Database Fix

**IMPORTANT**: Run the migration script immediately to fix FK constraint errors:

```bash
cd ecommerce-backend
node scripts/migrations/20250120_fix_all_fk_constraints.js
```

This will:
- Convert all FK columns (Carts, Orders, OrderItems, Wishlists) from INTEGER to UUID
- Drop and recreate FK constraints properly
- Preserve all existing data

## Environment Variables

### Backend (.env)
```env
# Database
PG_HOST=127.0.0.1
PG_PORT=5432
PG_DB=tn16_tirupur_cotton
PG_USER=postgres
PG_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@tn16.com
ADMIN_NOTIFICATION_EMAILS=admin@tn16.com

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_NOTIFICATION_WHATSAPP=whatsapp:+919876543210

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Client
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Installation & Setup

```bash
# Backend
cd ecommerce-backend
npm install
node scripts/migrations/20250120_add_mobile_number.js
node scripts/migrations/20250120_fix_all_fk_constraints.js
node createAdmin.js
npm run dev

# Frontend (new terminal)
cd ecommerce-frontend
npm install
npm run dev
```

## Testing Checklist

### ✅ Database Migrations
- [ ] Run `20250120_fix_all_fk_constraints.js`
- [ ] Verify no FK constraint errors in logs
- [ ] Test order placement (should work without integer errors)

### ✅ Admin Login & Routing
- [ ] Login as admin → redirects to `/admin`
- [ ] Admin button appears in header (only for admins)
- [ ] Home button visible on left side of header
- [ ] Home link works from admin sidebar

### ✅ Registration
- [ ] Mobile defaults to +91
- [ ] Validates 10-digit Indian mobile numbers
- [ ] Country defaults to India
- [ ] State dropdown shows Indian states
- [ ] City dropdown shows cities for selected state

### ✅ Banner Management
- [ ] Can create banners (max 5 per slot)
- [ ] Can upload multiple images (1-5 per banner)
- [ ] Can set page (home, catalog, etc.)
- [ ] Can set position (hero, top, middle, etc.)
- [ ] Banner text is visible
- [ ] Images auto-rotate every 3 seconds
- [ ] Carousel displays on home page

### ✅ Product Grid
- [ ] Desktop: 6-8 products per row (responsive)
- [ ] Mobile: 4 visible products with swipeable carousel
- [ ] No visible slider buttons on mobile
- [ ] Consistent spacing and luxury look

### ✅ Order Flow
- [ ] Add to cart works
- [ ] Checkout loads
- [ ] Order placement creates Order & OrderItems
- [ ] No FK constraint errors
- [ ] Customer receives email confirmation
- [ ] Admin receives email + WhatsApp notification

### ✅ Admin Settings
- [ ] Can upload logo/images
- [ ] Can change colors (primary, secondary, etc.)
- [ ] Can change fonts
- [ ] Changes apply instantly
- [ ] Image upload shows correct count (not 0/1)

## Bug Fixes Summary

1. **FK Constraint Error**: Fixed by converting all FK columns to UUID
2. **Invalid Integer Error**: Fixed by proper UUID migration
3. **Banner Text Visibility**: Fixed CSS and added proper text overlay
4. **Image Upload Count**: Fixed ImageUploader component
5. **Admin Routing**: Fixed login redirect to `/admin`
6. **Product Grid**: Updated to 6-8 per row desktop, 4 swipeable mobile
7. **Registration**: Added India defaults and validation

## Known Issues & Solutions

- **Migration fails**: Ensure PostgreSQL is running and credentials are correct
- **Banner not showing**: Check banner is active, page/position match
- **Images not uploading**: Verify Cloudinary credentials in .env
- **Notifications not sending**: Check SendGrid/Twilio credentials

## Support

For issues, check:
1. Backend logs: `npm run dev` in backend folder
2. Frontend console: Browser DevTools
3. Database: Check PostgreSQL logs

