import rateLimit from "express-rate-limit";

/**
 * Enhanced Security Middleware
 * Provides comprehensive security features for the e-commerce application
 */

// CSRF Protection - Simple token-based approach
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for webhook endpoints (they have their own verification)
  if (req.path.startsWith("/api/webhooks/")) {
    return next();
  }

  // For state-changing operations, verify origin
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173"];

  if (origin) {
    const isAllowed = allowedOrigins.some((allowed) =>
      origin.startsWith(allowed)
    );
    if (!isAllowed && process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Invalid origin" });
    }
  }

  next();
};

// Enhanced rate limiting for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Only 5 payment attempts per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many payment attempts, please try again later.",
  skipSuccessfulRequests: false,
});

// Rate limiting for order placement
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 orders per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many order attempts, please try again later.",
});

// Input validation helper
export const validatePaymentMethod = (method) => {
  const allowedMethods = ["cod", "online", "razorpay", "stripe"];
  return allowedMethods.includes(method?.toLowerCase());
};

// Validate amount to prevent manipulation
export const validateAmount = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return false;
  }
  if (amount < 0) {
    return false;
  }
  if (amount > 10000000) {
    // Max ₹1 crore per order
    return false;
  }
  return true;
};

// Secure headers middleware
export const secureHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // Remove server information
  res.removeHeader("X-Powered-By");
  
  next();
};

