/**
 * Secure Token Storage Middleware
 * Uses httpOnly cookies instead of localStorage for better security
 */

import jwt from "jsonwebtoken";

const ACCESS_TOKEN_COOKIE = "tn16_access_token";
const REFRESH_TOKEN_COOKIE = "tn16_refresh_token";

/**
 * Set secure httpOnly cookies for tokens
 */
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true, // Prevents JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: "strict", // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes for access token
    path: "/",
  };

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
  };

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
};

/**
 * Clear token cookies
 */
export const clearTokenCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
};

/**
 * Get token from cookie or Authorization header (for backward compatibility)
 */
export const getTokenFromRequest = (req) => {
  // Try cookie first (more secure)
  if (req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
    return req.cookies[ACCESS_TOKEN_COOKIE];
  }

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/**
 * Enhanced protect middleware with cookie support
 */
export const protectWithCookies = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const User = (await import("../models/User.js")).default;
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    // Clear invalid token cookie
    clearTokenCookies(res);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

