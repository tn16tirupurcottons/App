# Banner Creation Guide

## Step-by-Step Instructions

### 1. Access Banner Management
- Log in as admin
- Navigate to **Admin Dashboard** → **Banners**

### 2. Create New Banner
- Click the **"New Banner"** button (top right)
- Fill in the form:

### 3. Required Fields

**Title** (Required)
- Enter a descriptive title (e.g., "Welcome to TN16")

**Banner Images** (Required - Max 5)
- Click or drag & drop images into the upload area
- You can upload 1-5 images
- Images will auto-rotate every 3 seconds
- Each image max size: 5MB
- Supported formats: JPEG, PNG, WebP

**Page** (Required)
- Select where the banner should appear:
  - `home` - Home page only
  - `catalog` - Catalog/Products page
  - `product` - Product detail pages
  - `cart` - Shopping cart page
  - `checkout` - Checkout page
  - `all` - All pages

**Position** (Required)
- Select banner position:
  - `hero` - Top hero section (recommended for home page)
  - `top` - Top section
  - `middle` - Middle section
  - `bottom` - Bottom section
  - `sidebar` - Sidebar (if applicable)

### 4. Optional Fields

**Subtitle**
- Additional text below the title

**CTA Label**
- Button text (e.g., "Shop Now", "Explore Collection")
- Default: "Shop Now"

**CTA Link**
- Where the button should link to (e.g., "/catalog", "/product/123")
- Default: "/catalog"

**Segment**
- Target audience segment:
  - `default` - All users
  - `men` - Men's section
  - `women` - Women's section
  - `kids` - Kids section
  - `genz` - Gen Z section

**Order**
- Display order (lower numbers appear first)
- Default: 0

**Active**
- Checkbox to enable/disable the banner
- Unchecked banners won't display

### 5. Save Banner
- Click **"Create"** button
- Banner will be saved and appear on the selected page/position

## Creating a Sample Banner

A sample banner has been created automatically. To create it manually or verify it exists:

```bash
cd ecommerce-backend
node scripts/createSampleBanner.js
```

## Banner Display Rules

1. **Multiple Images**: If you upload multiple images, they rotate automatically every 3 seconds
2. **Multiple Banners**: If multiple banners exist for the same page/position, they rotate every 3 seconds
3. **Active Only**: Only banners with "Active" checked will display
4. **Order**: Banners are sorted by "Order" field (ascending), then by creation date

## Troubleshooting

**Banner not showing?**
- Check that banner is "Active"
- Verify page and position match where you're looking
- Check browser console for errors
- Ensure images uploaded successfully

**Images not rotating?**
- Ensure you uploaded multiple images (2-5)
- Check that banner is active
- Verify carousel component is loaded

**Can't upload images?**
- Check file size (max 5MB)
- Verify file format (JPEG, PNG, WebP)
- Check Cloudinary configuration in backend .env

## Best Practices

1. **Image Size**: Use high-quality images, optimized for web (recommended: 1200x600px)
2. **Text Overlay**: Ensure text is readable with proper contrast
3. **CTA Buttons**: Make call-to-action buttons clear and prominent
4. **Mobile Responsive**: Test banners on mobile devices
5. **Performance**: Limit to 5 images per banner for fast loading

