import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import { issueTokensForUser, toPublicUser } from "../authController.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // First check if user exists with this email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Issue tokens
    try {
      // Check if JWT secrets are set
      if (!process.env.JWT_ACCESS_SECRET) {
        console.error("JWT_ACCESS_SECRET is not set in environment variables");
        throw new Error("JWT configuration missing");
      }

      const tokens = await issueTokensForUser(user, res);

      res.json({
        success: true,
        user: toPublicUser(user),
        token: tokens.accessToken, // Also include as 'token' for compatibility
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      console.error("Token error details:", {
        message: tokenError.message,
        stack: tokenError.stack,
        hasJWTSecret: !!process.env.JWT_ACCESS_SECRET,
      });
      
      // Return a more helpful error
      return res.status(500).json({ 
        error: "Token generation failed",
        message: tokenError.message,
        hint: "Check JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env file"
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findByPk(req.user?.id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ success: true, user: toPublicUser(admin) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
