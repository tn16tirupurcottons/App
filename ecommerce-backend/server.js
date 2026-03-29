// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { execSync } from "child_process";
import nodemailer from "nodemailer";
dotenv.config();
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
});
process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION:", error);
});

// Database Sync
import { syncDB, sequelize } from "./models/index.js";

// User Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";
import appImageRoutes from "./routes/appImageRoutes.js";
import adminAppImageRoutes from "./routes/adminAppImageRoutes.js";
import publicBannerRoutes from "./routes/publicBannerRoutes.js";

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
} else {
  app.use(morgan(":method :url :status :response-time ms"));
}

// ---------------------------
// BODY PARSERS
// ---------------------------
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ---------------------------
// INPUT SANITIZATION
// ---------------------------
/**
 * Basic recursive input sanitization middleware.
 * - Strips script tags
 * - Trims strings
 * - Prevents simple injection payloads in body/query/params
 *
 * NOTE: This is an additional safety net on top of parameterized queries
 * via Sequelize. Do NOT rely on this alone for security.
 */
const sanitizeInput = (req, _res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === "string") {
      // Remove script tags and trim whitespace
      return value
        .replace(/<\s*script/gi, "")
        .replace(/<\s*\/\s*script\s*>/gi, "")
        .trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === "object") {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

app.use(sanitizeInput);

// ---------------------------
// API REQUEST LOGGING (method + URL for /api/auth — helps debug 405/proxy issues)
// ---------------------------
app.use((req, _res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

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
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is running" });
});
app.get("/api/health/deps", async (_req, res) => {
  let db = "fail";
  let smtp = "fail";
  let error = null;

  // DB check
  try {
    await sequelize.authenticate();
    db = "ok";
  } catch (dbError) {
    error = dbError?.message || String(dbError);
  }

  // SMTP check (verify only, no real email)
  try {
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("Email service not configured");
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
    await transporter.verify();
    smtp = "ok";
  } catch (smtpError) {
    console.error("SMTP VERIFY ERROR:", smtpError);
    error = error || smtpError?.message || String(smtpError);
  }

  if (db === "ok" && smtp === "ok") {
    return res.status(200).json({
      success: true,
      db,
      smtp,
    });
  }

  return res.status(500).json({
    success: false,
    db,
    smtp,
    error,
  });
});

// ---------------------------
// USER ROUTES
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/images", appImageRoutes);
app.use("/api/banners", publicBannerRoutes);

// ---------------------------
// ADMIN ROUTES
// ---------------------------
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/banners", adminBannerRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/app-images", adminAppImageRoutes);

// ---------------------------
// ERROR HANDLER (LAST)
// ---------------------------
app.use(errorHandler);

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;

// Helper function to free port if in use (Windows only)
const freePortIfInUse = (port) => {
  if (process.platform !== "win32") return Promise.resolve();
  
  return new Promise((resolve) => {
    const checkAndKill = (attempts = 0) => {
      try {
        const output = execSync(
          `netstat -ano | findstr :${port} | findstr LISTENING`,
          { encoding: "utf8", stdio: "pipe" }
        ).trim();
        
        if (output) {
          const lines = output.split("\n").filter(line => line.trim());
          const pids = lines
            .map((line) => {
              const parts = line.trim().split(/\s+/);
              return parts[parts.length - 1]; // Get last column (PID)
            })
            .filter(Boolean)
            .filter((pid) => pid !== "0" && !isNaN(parseInt(pid)))
            .filter((pid, index, arr) => arr.indexOf(pid) === index); // Remove duplicates
          
          if (pids.length > 0) {
            if (attempts === 0) {
              console.log(`⚠️  Port ${port} is in use. Attempting to free it...`);
            }
            
            let killedAny = false;
            pids.forEach((pid) => {
              try {
                execSync(`taskkill /F /PID ${pid}`, { 
                  stdio: "ignore",
                  timeout: 5000
                });
                console.log(`   ✅ Killed process ${pid}`);
                killedAny = true;
              } catch (e) {
                // Process might already be terminated
              }
            });
            
            // Wait a bit for port to be released
            setTimeout(() => {
              // Check again if port is still in use
              try {
                const checkOutput = execSync(
                  `netstat -ano | findstr :${port} | findstr LISTENING`,
                  { encoding: "utf8", stdio: "pipe" }
                ).trim();
                
                if (checkOutput && attempts < 3) {
                  // Retry if port still in use
                  console.log(`   ⏳ Port still in use, retrying... (attempt ${attempts + 2}/3)`);
                  checkAndKill(attempts + 1);
                } else if (checkOutput) {
                  console.log(`\n❌ Port ${port} is still in use after cleanup attempt.`);
                  console.log(`   Please run: npm run kill-port`);
                  console.log(`   Or manually: netstat -ano | findstr :${port} then taskkill /F /PID <PID>\n`);
                  resolve(); // Still resolve to attempt server start
                } else {
                  console.log(`   ✅ Port ${port} is now free!\n`);
                  resolve();
                }
              } catch (e) {
                // Port is free (netstat returned error = no matches)
                console.log(`   ✅ Port ${port} is now free!\n`);
                resolve();
              }
            }, killedAny ? 1500 : 500);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      } catch (e) {
        if (e.status === 1 || e.code === 1) {
          // netstat returns 1 when no matches found - port is free
          resolve();
        } else {
          console.error("❌ Error during port cleanup:", e.message);
          resolve(); // Still resolve to attempt server start
        }
      }
    };
    
    checkAndKill();
  });
};

const startServer = async () => {
  try {
    await syncDB();
    console.log("✅ Database synced successfully!");
    await bootstrapCatalog().catch((error) =>
      console.error("❌ Catalog bootstrap failed:", error?.message || error)
    );

    await freePortIfInUse(PORT);

    const server = app.listen(PORT, () => {
      console.log("Server running on port", PORT);
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is still in use after cleanup attempt.`);
        console.error(`   Please run: npm run kill-port`);
        console.error(`   Or manually: netstat -ano | findstr :${PORT} then taskkill /F /PID <PID>`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  } catch (err) {
    console.error("❌ Server startup error:", err);
  }
};

startServer();
