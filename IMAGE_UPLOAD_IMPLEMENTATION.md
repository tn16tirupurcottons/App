# Image Upload System Implementation

This implementation adds a production-ready image upload system to the ecommerce admin panel.

## Backend Changes

### Dependencies Added
- `sharp`: For image processing and optimization

### Files Created/Modified
- `controllers/uploadController.js`: Handles image upload, processing, and storage
- `routes/uploadRoutes.js`: API endpoints for single and bulk uploads
- `server.js`: Added static file serving for uploads directory

### API Endpoints
- `POST /api/upload/single`: Single image upload
- `POST /api/upload/multiple`: Bulk image upload (up to 20 images)

### Features
- File validation (type, size)
- Image optimization with Sharp (resize to 800px max width, convert to WebP)
- Unique filename generation
- Local storage in `/uploads` directory
- Proper error handling

## Frontend Changes

### Dependencies Added
- `react-easy-crop`: For image cropping functionality
- `react-dropzone`: For drag & drop file upload
- `react-hot-toast`: For toast notifications

### Files Created
- `components/ui/Button.jsx`: Reusable button component
- `admin/components/ImageCropper.jsx`: Image cropping modal
- `admin/components/AdminImageUpload.jsx`: Main upload component with drag & drop, preview, and bulk upload
- `pages/admin/ImageUpload.jsx`: Admin page for image uploads

### Features
- Drag & drop upload area
- Single and bulk image upload
- Image cropping with zoom and pan
- Upload progress indicators
- Image preview grid
- Copy URL to clipboard
- Grid/List view toggle
- Toast notifications for success/error

## Installation & Setup

### Backend
```bash
cd ecommerce-backend
npm install
```

### Frontend
```bash
cd ecommerce-frontend
npm install
```

## Running the Application

### Backend
```bash
cd ecommerce-backend
npm start
# or for development
npm run dev
```

### Frontend
```bash
cd ecommerce-frontend
npm run dev
```

## Usage

1. Navigate to `/admin/upload` in the admin panel
2. Drag & drop images or click to select files
3. Optionally crop images using the crop tool
4. Click "Upload" to process and upload images
5. Copy image URLs from the uploaded images section

## Technical Details

### Image Processing
- Max file size: 50MB
- Supported formats: JPG, JPEG, PNG, WebP, GIF
- Optimized to: 800px max width, WebP format, 80% quality
- Stored locally in `/uploads` directory

### Security
- Admin-only access required
- File type validation
- Size limits enforced
- Sanitized filenames

### Error Handling
- Comprehensive error messages
- Graceful failure handling for bulk uploads
- User-friendly toast notifications

## File Structure
```
ecommerce-backend/
├── controllers/
│   └── uploadController.js
├── routes/
│   └── uploadRoutes.js
└── uploads/ (created automatically)

ecommerce-frontend/
├── components/
│   └── ui/
│       └── Button.jsx
├── admin/
│   └── components/
│       ├── ImageCropper.jsx
│       └── AdminImageUpload.jsx
└── pages/
    └── admin/
        └── ImageUpload.jsx
```

## API Response Format

### Single Upload Success
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/timestamp-random.webp",
    "filename": "timestamp-random.webp"
  }
}
```

### Bulk Upload Success
```json
{
  "success": true,
  "message": "X images uploaded successfully",
  "data": [
    {
      "url": "/uploads/timestamp-random.webp",
      "filename": "timestamp-random.webp"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Notes
- Ensure the `/uploads` directory has proper write permissions
- Nginx should be configured to serve static files from the uploads directory
- The system automatically creates the uploads directory if it doesn't exist
- Images are processed server-side for optimal performance and security