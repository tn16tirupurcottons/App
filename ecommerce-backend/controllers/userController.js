import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { ensureInsiderUpgraded } from "../services/insiderService.js";

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
  joinedAt: user.createdAt,
  is_insider: user.is_insider,
  insider_since: user.insider_since,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkEmailAvailability = async (req, res, next) => {
  try {
    const normalizedEmail = String(req.query?.email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    return res.json({ exists: Boolean(existing) });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    await ensureInsiderUpgraded(req.user.id);
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ success: true, user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    
    // VALIDATION: Required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Valid name is required" });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email address format" });
    }

    // VALIDATION: Email uniqueness
    const duplicate = await User.findOne({ where: { email: normalizedEmail } });
    if (duplicate && duplicate.id !== req.user.id) {
      return res.status(409).json({ success: false, message: "Email is already in use by another account" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = String(name).trim();
    user.email = normalizedEmail;
    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    
    // VALIDATION: Required fields
    if (!oldPassword || typeof oldPassword !== "string") {
      return res.status(400).json({ success: false, message: "Current password is required" });
    }
    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // VALIDATION: Password length
    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    // VALIDATION: Passwords are different
    if (String(oldPassword).trim() === String(newPassword).trim()) {
      return res.status(400).json({ success: false, message: "New password must be different from current password" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // VALIDATION: Old password is correct
    const matches = await bcrypt.compare(String(oldPassword), user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = String(newPassword).trim();
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return next(error);
  }
};

