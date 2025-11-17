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

// Admin Routes
import adminAuthRoutes from "./routes/admin/adminAuthRoutes.js";
import adminProductRoutes from "./routes/admin/adminProductRoutes.js";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes.js";

// Middlewares
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

/* -------------------------------
   GLOBAL SECURITY MIDDLEWARES
-------------------------------- */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow serving images from static folders
  })
);
app.use(compression());
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* -------------------------------
   BODY PARSERS
-------------------------------- */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use("/api", apiLimiter);

/* -------------------------------
   HEALTH CHECK
-------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({ message: "📦 E-commerce backend running..." });
});

/* -------------------------------
   USER ROUTES
-------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);

/* -------------------------------
   ADMIN ROUTES
-------------------------------- */
app.use("/api/admin", adminAuthRoutes); // login, profile
app.use("/api/admin/products", adminProductRoutes); // admin product CRUD
app.use("/api/admin/dashboard", adminDashboardRoutes);

/* -------------------------------
   ERROR HANDLER (LAST MIDDLEWARE)
-------------------------------- */
app.use(errorHandler);

/* -------------------------------
   START SERVER
-------------------------------- */
const PORT = process.env.PORT || 5000;

syncDB()
  .then(() => {
    console.log("✅ Database synced successfully!");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database Sync Error:", err);
  });
