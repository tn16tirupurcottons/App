# 🛍️ TN16 Ecommerce Platform

A modern, full-stack ecommerce application built with React (Vite) frontend and Node.js (Express) backend. Production-ready with comprehensive features for clothing retail.

## ✨ Features

### Frontend
- 🎨 Modern React 19 with Vite for blazing-fast development
- 📱 Fully responsive design with TailwindCSS
- 🔍 Product catalog with advanced filtering
- 🛒 Shopping cart management
- 📦 Order tracking and management
- 👤 User authentication and profiles
- ⭐ Wishlist functionality
- 💳 Multiple payment gateway integration (Stripe, Razorpay)
- 🖼️ Image cropping and optimization
- 📊 Admin dashboard for product management
- 🔒 Error boundaries and production-ready error handling

### Backend
- ⚡ Express.js with modular architecture
- 🔐 JWT-based authentication with bcrypt password hashing
- 📊 Sequelize ORM with PostgreSQL
- 🖼️ Image upload and processing with Multer & Sharp
- 📧 Email notifications (SMTP, SendGrid)
- 💰 Payment gateway integration (Stripe, Razorpay)
- 📱 SMS notifications (Twilio)
- 🛡️ Security middleware (CORS, Helmet, Rate Limiting)
- 📝 Comprehensive validation and sanitization
- 🔄 Database migrations and seeders
- 🎯 Dynamic pricing system
- 📦 Product management with variants (size, color)

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v12 or higher (for production)
- **Git**: for version control

### One-Command Setup

#### On macOS/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

#### On Windows:
```bash
setup.bat
```

This script will:
1. ✅ Check Node.js and npm installation
2. ✅ Install frontend dependencies
3. ✅ Install backend dependencies
4. ✅ Display configuration instructions

### Manual Setup

```bash
# Install dependencies for both frontend and backend
npm run install-all

# Or install individually
npm run install-frontend
npm run install-backend
```

## ⚙️ Configuration

### Backend Environment Setup

1. **Copy the environment template:**
   ```bash
   cp ecommerce-backend/.env.example ecommerce-backend/.env
   ```

2. **Configure your `.env` file** with the following critical variables:
   ```env
   # Database
   DB_URL=postgresql://user:password@localhost:5432/tn16_ecommerce

   # JWT Secrets (Generate strong random strings in production)
   JWT_ACCESS_SECRET=your_random_secret_key
   JWT_REFRESH_SECRET=your_random_refresh_key

   # Payment Gateways (Optional but recommended)
   STRIPE_SECRET_KEY=sk_test_...
   RAZORPAY_KEY_ID=...
   ```

3. **Database Setup:**
   ```bash
   # Create PostgreSQL database
   createdb tn16_ecommerce

   # Run migrations (automatic on server start)
   npm run dev:backend
   ```

### Frontend Environment Setup (Optional)

```bash
cp ecommerce-frontend/.env.example ecommerce-frontend/.env
```

Configure if needed (mostly for API URLs in production):
```env
VITE_API_URL=http://localhost:5001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🎯 Available Commands

### Full Stack Development
```bash
# Start both frontend and backend
npm run dev

# Start in separate terminals for better visibility
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

### Individual Commands

**Frontend:**
```bash
npm run dev:frontend      # Development server (http://localhost:5173)
npm run build             # Production build
npm run preview           # Preview production build
npm run lint              # Run ESLint
npm run test              # Run vitest tests
```

**Backend:**
```bash
npm run dev:backend       # Development server with auto-reload (http://localhost:5001)
npm run start:backend     # Production server
npm run test              # Run tests
npm run kill-port         # Kill process on port 5001 (Windows)
```

### Utility Commands
```bash
npm run clean             # Remove all node_modules
npm run clean-full        # Remove node_modules and build outputs
npm run build             # Build frontend for production
npm run start             # Start both servers in production mode
```

## 📁 Project Structure

```
tn16/
├── ecommerce-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/              # Page components and admin pages
│   │   ├── context/            # React Context for state management
│   │   ├── api/                # API client configuration
│   │   └── App.jsx             # Root component
│   ├── public/                 # Static assets
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies
│
├── ecommerce-backend/           # Node.js + Express backend
│   ├── controllers/            # Business logic
│   ├── models/                 # Sequelize models
│   ├── routes/                 # API routes
│   ├── middlewares/            # Custom middleware
│   ├── services/               # Business services
│   ├── scripts/                # Database migrations & seeders
│   ├── config/                 # Configuration files
│   ├── server.js               # Express server setup
│   └── package.json            # Backend dependencies
│
├── setup.sh                     # Linux/macOS setup script
├── setup.bat                    # Windows setup script
├── package.json                 # Root package.json (orchestration)
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product by ID
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### Admin
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `GET /api/admin/orders` - List all orders

See full API documentation in backend routes folder.

## 💾 Database Schema

### Key Tables
- **Users** - User accounts and authentication
- **Products** - Product catalog with attributes
- **Categories** - Product categories
- **Cart** - Shopping cart items
- **Orders** - Customer orders
- **OrderItems** - Order line items
- **Coupons** - Discount coupons
- **Wishlist** - User wishlists

Database automatically syncs on server startup via Sequelize.

## 🔐 Security Features

✅ **Auth & Encryption**
- JWT token-based authentication
- Bcrypt password hashing
- Secure session management

✅ **HTTP Security**
- Helmet for security headers
- CORS configuration
- Rate limiting (express-rate-limit)
- Input validation & sanitization

✅ **Data Protection**
- Environment variables for secrets
- No credentials in code
- Secure file uploads

## 📦 Dependency Overview

### Frontend
- **react** (19.2.0) - UI framework
- **react-router-dom** (6.30.1) - Client-side routing
- **@tanstack/react-query** (5.90.8) - Server state management
- **axios** (1.13.2) - HTTP client
- **tailwindcss** (3.4.14) - Utility CSS framework
- **react-hot-toast** (2.4.1) - Toast notifications
- **react-easy-crop** (5.2.0) - Image cropping
- **@stripe/react-stripe-js** (3.3.1) - Stripe payment integration
- **formik** (2.4.9) - Form state management
- **vite** (7.2.2) - Build tool & dev server

### Backend
- **express** (4.21.2) - Web framework
- **sequelize** (6.37.7) - ORM
- **pg** (8.16.3) - PostgreSQL driver
- **jsonwebtoken** (9.0.2) - JWT creation/verification
- **bcryptjs** (2.4.3) - Password hashing
- **multer** (2.0.2) - File upload handling
- **sharp** (0.33.5) - Image processing
- **dotenv** (17.2.3) - Environment variable loader
- **cors** (2.8.5) - CORS middleware
- **helmet** (7.2.0) - Security headers
- **stripe** (17.6.0) - Stripe SDK
- **razorpay** (2.9.6) - Razorpay SDK
- **nodemon** (3.1.11) - Development auto-reload

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill port 5001 (backend)
npm run kill-port

# Or manually
lsof -ti:5001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5001   # Windows
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Create database if not exists
createdb tn16_ecommerce

# Check .env DATABASE_URL is correct
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm run clean
npm run install-all
```

### Port 5173 or 5001 Already in Use
Edit `vite.config.js` (frontend) or update PORT in `.env` (backend) to use different ports.

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
npm run build-frontend

# Backend runs as Node.js directly
npm run start:backend

# Or with process manager (PM2)
npm install -g pm2
pm2 start ecommerce-backend/server.js --name "tn16-api"
```

### Environment Setup for Production
1. Update `.env` with production database URL
2. Use strong JWT secrets
3. Configure payment gateway keys
4. Enable HTTPS
5. Set up proper database backups
6. Use a process manager (PM2, systemd)
7. Configure nginx/Apache as reverse proxy

## 📝 License

This project is private and proprietary to TN16.

## 📞 Support & Documentation

For detailed API documentation, see:
- Frontend: `ecommerce-frontend/README.md`
- Backend: `ecommerce-backend/README.md`

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production-Ready ✅
