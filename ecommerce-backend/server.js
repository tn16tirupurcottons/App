// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Database Sync
import { syncDB } from "./models/index.js";

// User Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";

// Admin Routes
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import adminProductRoutes from "./routes/admin/adminProductRoutes.js";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes.js";
import adminBannerRoutes from "./routes/admin/adminBannerRoutes.js";
import adminSettingsRoutes from "./routes/admin/adminSettingsRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";

// Utils
import { bootstrapCatalog } from "./utils/bootstrapCatalog.js";

// Middlewares
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();
app.set("trust proxy", 1);

// ---------------------------
// CORS CONFIG
// ---------------------------
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://18.237.198.9"]; // default frontend URLs

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server requests / Postman
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // allow cookies and Authorization headers
  })
);

// ---------------------------
// SECURITY & PERFORMANCE
// ---------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow static files like images
  })
);
app.use(compression());
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ---------------------------
// BODY PARSERS
// ---------------------------
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ---------------------------
// INPUT SANITIZATION
// ---------------------------
app.use(sanitizeInput);

// ---------------------------
// RATE LIMITING
// ---------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Only 10 requests per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/send-otp", authLimiter);
app.use("/api/auth/verify-otp-register", authLimiter);
app.use("/api/auth/request-password-reset", authLimiter);

// ---------------------------
// HEALTH CHECK
// ---------------------------
app.get("/", (req, res) => {
  res.status(200).json({ message: "📦 E-commerce backend running..." });
});

// ---------------------------
// USER ROUTES
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/theme", themeRoutes);

// ---------------------------
// ADMIN ROUTES
// ---------------------------
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/banners", adminBannerRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/users", adminUserRoutes);

// ---------------------------
// ERROR HANDLER (LAST)
// ---------------------------
app.use(errorHandler);

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;

syncDB()
  .then(async () => {
    console.log("✅ Database synced successfully!");
    await bootstrapCatalog().catch((error) =>
      console.error("❌ Catalog bootstrap failed:", error?.message || error)
    );
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database Sync Error:", err);
  });
