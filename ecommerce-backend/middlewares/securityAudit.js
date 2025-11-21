/**
 * Security Audit & Monitoring Middleware
 * Logs security events and suspicious activities
 */

const securityEvents = [];

export const logSecurityEvent = (event) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...event,
  };

  securityEvents.push(logEntry);

  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with monitoring service (e.g., Sentry, LogRocket)
    console.log("[SECURITY EVENT]", logEntry);
  } else {
    console.log("[SECURITY EVENT]", logEntry);
  }
};

/**
 * Monitor suspicious activities
 */
export const securityAudit = (req, res, next) => {
  // Monitor failed authentication attempts
  const originalJson = res.json;
  res.json = function (data) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent({
        type: "AUTH_FAILURE",
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        status: res.statusCode,
      });
    }

    // Monitor payment failures
    if (req.path.includes("/orders") && res.statusCode >= 400) {
      logSecurityEvent({
        type: "PAYMENT_FAILURE",
        path: req.path,
        method: req.method,
        ip: req.ip,
        status: res.statusCode,
      });
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Get security events (admin only)
 */
export const getSecurityEvents = () => {
  return securityEvents.slice(-100); // Last 100 events
};

