import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminOnly = async (req, res, next) => {
  try {
    // SECURITY FIX: Robust token extraction
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ message: "No authorization header" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];
    if (!token || typeof token !== "string") {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ message: "Token invalid or expired", error: jwtErr.message });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Authentication error", error: err.message });
  }
};
