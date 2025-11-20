import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { sendPasswordResetNotice } from "../services/notificationService.js";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
const REFRESH_COOKIE = "tn16_refresh_token";

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
});

const signAccessToken = (user) =>
  jwt.sign(toPublicUser(user), process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });

const persistRefreshToken = async (token, userId) => {
  await RefreshToken.destroy({ where: { userId } });
  return RefreshToken.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + ms(REFRESH_TTL)),
  });
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: ms(REFRESH_TTL),
  path: "/",
};

const attachRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions);
};

export const issueTokensForUser = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(refreshToken, user.id);
  attachRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ message: "mobileNumber is required" });
    }

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (mobileNumber) {
      const mobileExists = await User.findOne({ where: { mobileNumber } });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }

    const user = await User.create({ name, email, password, mobileNumber });
    const tokens = await issueTokensForUser(user, res);

    res.status(201).json({
      success: true,
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "identifier and password are required" });
    }
    const whereClause = identifier?.includes("@")
      ? { email: identifier }
      : { mobileNumber: identifier };
    const user = await User.findOne({ where: whereClause });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const tokens = await issueTokensForUser(user, res);

    res.json({
      success: true,
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ success: true, user: toPublicUser(req.user) });
};

export const refresh = async (req, res, next) => {
  try {
    const incoming =
      req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken || null;
    if (!incoming) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const record = await RefreshToken.findOne({ where: { token: incoming } });
    if (!record) {
      return res.status(401).json({ message: "Refresh token invalid" });
    }

    const decoded = jwt.verify(incoming, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      await record.destroy();
      return res.status(404).json({ message: "User no longer exists" });
    }

    await record.destroy();
    const tokens = await issueTokensForUser(user, res);

    res.json({
      success: true,
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const incoming =
      req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken || null;
    if (incoming) {
      await RefreshToken.destroy({ where: { token: incoming } });
    }
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res
        .status(400)
        .json({ message: "identifier (email or mobile) required" });
    }
    const whereClause = identifier.includes("@")
      ? { email: identifier }
      : { mobileNumber: identifier };
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.json({
        success: true,
        message:
          "If the account exists, password reset instructions have been sent.",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await PasswordResetToken.create({
      token,
      userId: user.id,
      expiresAt,
      deliveryChannel: identifier.includes("@") ? "email" : "whatsapp",
    });
    const clientUrl =
      process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173";
    const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
    await sendPasswordResetNotice({ user, resetUrl }).catch((err) =>
      console.error("[notifications] password reset email failed", err)
    );
    res.json({
      success: true,
      message:
        "If the account exists, password reset instructions have been sent.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "token and password are required" });
    }
    const resetRecord = await PasswordResetToken.findOne({
      where: { token },
      include: [{ model: User }],
    });
    if (
      !resetRecord ||
      resetRecord.consumedAt ||
      resetRecord.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Reset token is invalid" });
    }
    resetRecord.User.password = password;
    await resetRecord.User.save();
    resetRecord.consumedAt = new Date();
    await resetRecord.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
