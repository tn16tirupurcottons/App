// middleware/adminAuth.js
import jwt from "jsonwebtoken";

/**
 * Middleware to protect admin routes
 * Checks for a valid JWT token and ensures the user has 'admin' role
 */
export const verifyAdmin = (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Only allow admin users
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized, admin only" });
    }

    // Attach user info to request
    req.user = decoded;

    // Proceed to next middleware / route
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};
