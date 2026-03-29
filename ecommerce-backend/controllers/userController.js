import bcrypt from "bcryptjs";
import User from "../models/User.js";

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
  joinedAt: user.createdAt,
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
    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const duplicate = await User.findOne({ where: { email: normalizedEmail } });
    if (duplicate && duplicate.id !== req.user.id) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = String(name).trim();
    user.email = normalizedEmail;
    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "oldPassword and newPassword are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(String(oldPassword), user.password);
    if (!matches) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = String(newPassword);
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

