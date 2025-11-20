import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import OtpToken from "../models/OtpToken.js";
import { sendPasswordResetNotice, sendEmail, sendSMS } from "../services/notificationService.js";

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
    
    // Email is required
    if (!email || !name || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    // Check if email already exists (enforce one account per email)
    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "An account with this email already exists. Please use a different email or log in." });
    }
    
    // Mobile number is optional, but if provided, must be unique
    if (mobileNumber && mobileNumber.trim()) {
      const mobileExists = await User.findOne({ where: { mobileNumber } });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      mobileNumber: mobileNumber && mobileNumber.trim() ? mobileNumber : null 
    });
    const tokens = await issueTokensForUser(user, res);

    res.status(201).json({
      success: true,
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      if (err.errors?.some(e => e.path === "email")) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      if (err.errors?.some(e => e.path === "mobileNumber")) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }
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

// OTP Verification for Registration
export const sendOtp = async (req, res, next) => {
  try {
    const { identifier, method } = req.body;
    if (!identifier || !method) {
      return res.status(400).json({ message: "identifier and method are required" });
    }
    if (!["email", "mobile"].includes(method)) {
      return res.status(400).json({ message: "method must be 'email' or 'mobile'" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this identifier
    await OtpToken.destroy({
      where: { identifier, verified: false },
    });

    // Create new OTP
    await OtpToken.create({
      otp,
      identifier,
      method,
      expiresAt,
    });

    // Send OTP
    try {
      if (method === "email") {
        await sendEmail({
          to: identifier,
          subject: "Your TN16 Registration OTP",
          html: `
            <h2>Your OTP for TN16 Registration</h2>
            <p>Your OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `,
        });
        console.log(`[OTP] Email OTP sent to ${identifier}`);
      } else {
        await sendSMS({
          to: identifier,
          body: `Your TN16 registration OTP is ${otp}. Valid for 10 minutes.`,
        });
        console.log(`[OTP] SMS OTP sent to ${identifier}`);
      }
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (sendError) {
      console.error("[OTP] Failed to send OTP:", sendError);
      // Still return success to prevent enumeration, but log the error
      res.json({ success: true, message: "OTP sent successfully" });
    }
  } catch (err) {
    next(err);
  }
};

export const verifyOtpAndRegister = async (req, res, next) => {
  try {
    const { name, email, mobileNumber, password, otp, identifier } = req.body;
    if (!name || !email || !password || !otp || !identifier) {
      return res.status(400).json({ message: "name, email, password, otp, and identifier are required" });
    }

    // Verify OTP
    const otpRecord = await OtpToken.findOne({
      where: { identifier, otp, verified: false },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if email already exists (enforce one account per email)
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "An account with this email already exists. Please use a different email." });
    }

    // Check mobile number only if provided
    if (mobileNumber) {
      const mobileExists = await User.findOne({ where: { mobileNumber } });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }

    // Create user (mobileNumber is optional)
    const user = await User.create({ 
      name, 
      email, 
      password, 
      mobileNumber: mobileNumber || null 
    });

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: toPublicUser(user),
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      if (err.errors?.some(e => e.path === "email")) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      if (err.errors?.some(e => e.path === "mobileNumber")) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }
    next(err);
  }
};
