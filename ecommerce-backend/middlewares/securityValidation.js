/**
 * Security Validation Middleware
 * Validates environment variables and prevents credential leakage
 */

export const validateEnvironment = () => {
  const required = [
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "PG_HOST",
    "PG_DB",
    "PG_USER",
    "PG_PASSWORD",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("❌ Missing required environment variables:", missing.join(", "));
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Validate JWT secrets are strong
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
  }
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
  }

  // Warn if using default secrets
  if (
    process.env.JWT_ACCESS_SECRET.includes("replace-with") ||
    process.env.JWT_REFRESH_SECRET.includes("replace-with")
  ) {
    console.warn("⚠️  WARNING: Using default JWT secrets. Change them in production!");
  }

  return true;
};

/**
 * Prevent information leakage in error responses
 */
export const sanitizeErrorResponse = (err, req, res, next) => {
  // Don't leak internal errors in production
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    // Generic error messages for production
    if (err.status === 500) {
      return res.status(500).json({
        message: "An internal server error occurred. Please try again later.",
      });
    }
    
    // Don't expose database errors
    if (err.name === "SequelizeError" || err.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid request. Please check your input.",
      });
    }
  }

  // In development, show full error
  next(err);
};

/**
 * Prevent credential leakage in responses
 */
export const preventCredentialLeakage = (req, res, next) => {
  // Remove sensitive fields from responses
  const originalJson = res.json;
  res.json = function (data) {
    if (data && typeof data === "object") {
      // Remove sensitive fields
      const sensitiveFields = [
        "password",
        "secret",
        "key",
        "token",
        "apiKey",
        "accessToken",
        "refreshToken",
        "privateKey",
        "pg_password",
        "database_password",
      ];

      // Track visited objects to prevent circular reference stack overflow
      const visited = new WeakSet();
      const maxDepth = 10; // Prevent infinite recursion

      const sanitize = (obj, depth = 0) => {
        // Prevent infinite recursion
        if (depth > maxDepth) {
          return "[MAX_DEPTH_REACHED]";
        }

        // Handle null/undefined
        if (obj === null || obj === undefined) {
          return obj;
        }

        // Handle primitives
        if (typeof obj !== "object") {
          return obj;
        }

        // Handle circular references
        if (visited.has(obj)) {
          return "[CIRCULAR_REFERENCE]";
        }

        // Handle Date objects
        if (obj instanceof Date) {
          return obj;
        }

        // Handle arrays
        if (Array.isArray(obj)) {
          visited.add(obj);
          const result = obj.map((item) => sanitize(item, depth + 1));
          visited.delete(obj);
          return result;
        }

        // Handle Sequelize models - convert to plain object first
        if (obj && typeof obj.toJSON === "function") {
          try {
            obj = obj.toJSON();
          } catch (e) {
            // If toJSON fails, skip this object
            return "[SEQUELIZE_MODEL]";
          }
        }

        // Handle plain objects
        if (obj && typeof obj === "object") {
          visited.add(obj);
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            // Skip sensitive fields
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
              sanitized[key] = "[REDACTED]";
            } else {
              sanitized[key] = sanitize(value, depth + 1);
            }
          }
          visited.delete(obj);
          return sanitized;
        }

        return obj;
      };

      try {
        data = sanitize(data);
      } catch (error) {
        // If sanitization fails, log but don't break the response
        console.error("[Sanitization Error]:", error.message);
        // Return original data if sanitization fails
      }
    }
    return originalJson.call(this, data);
  };
  next();
};

/**
 * Validate request origin
 */
export const validateOrigin = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173"];

  // Allow server-to-server requests
  if (!origin) {
    return next();
  }

  // In production, strictly validate origin
  if (process.env.NODE_ENV === "production") {
    const isAllowed = allowedOrigins.some((allowed) => origin.startsWith(allowed));
    if (!isAllowed) {
      return res.status(403).json({ message: "Invalid origin" });
    }
  }

  next();
};

/**
 * Request size validation
 */
export const validateRequestSize = (req, res, next) => {
  const contentLength = req.headers["content-length"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({ message: "Request too large" });
  }

  next();
};

