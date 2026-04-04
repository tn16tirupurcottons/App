export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  let status = err.status || err.statusCode || 500;
  let message = err.message || "An error occurred";

  // Handle specific error types
  if (err instanceof SyntaxError && "body" in err) {
    // JSON parsing error
    status = 400;
    message = "Invalid JSON in request body";
  } else if (err.name === "ValidationError" || err.name === "SequelizeValidationError") {
    status = 400;
    message = "Validation failed: " + (err.errors ? err.errors.map((e) => e.message).join(", ") : message);
  } else if (err.name === "SequelizeUniqueConstraintError") {
    status = 409;
    message = "Resource already exists (duplicate entry)";
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    status = 400;
    message = "Invalid reference to related resource";
  } else if (err.name === "SequelizeError") {
    status = 500;
    message = "Database error occurred";
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid or expired token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired";
  } else if (err.name === "UnauthorizedError") {
    status = 401;
    message = "Unauthorized access";
  }

  // Log error (development or monitoring)
  if (!isProduction) {
    console.error("Error:", {
      name: err.name,
      message: err.message,
      status,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  } else {
    // In production, log to monitoring system
    console.error("Error:", {
      name: err.name,
      message: err.message,
      status,
      path: req.path,
      method: req.method,
    });
  }

  // Send response (production-safe)
  res.status(status).json({
    success: false,
    message: isProduction ? getProductionMessage(status, message) : message,
    ...(isProduction ? {} : { error: err.message, stack: err.stack }),
  });
};

// Production-safe error messages
const getProductionMessage = (status, defaultMessage) => {
  const messages = {
    400: "Bad request. Please check your input.",
    401: "Unauthorized. Please log in.",
    403: "Access forbidden.",
    404: "Resource not found.",
    409: "Resource conflict. Try again or use different data.",
    500: "Internal server error. Please try again later.",
  };
  return messages[status] || defaultMessage;
};
