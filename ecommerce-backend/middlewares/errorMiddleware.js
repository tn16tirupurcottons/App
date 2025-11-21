export const errorHandler = (err, req, res, next) => {
  // Log error details (server-side only)
  const isProduction = process.env.NODE_ENV === "production";
  const status = err.status || err.statusCode || 500;
  
  if (!isProduction) {
    console.error("Error:", err);
  } else {
    // In production, log to monitoring service (implement as needed)
    console.error("Error:", {
      message: err.message,
      status,
      path: req.path,
      method: req.method,
      // Don't log sensitive data
    });
  }

  // Don't leak internal errors in production
  if (isProduction) {
    // Generic error messages for production
    if (status === 500) {
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
  res.status(status).json({
    message: err.message,
    stack: isProduction ? null : err.stack,
  });
};
