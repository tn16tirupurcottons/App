import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import OtpToken from "../models/OtpToken.js";
import { sendPasswordResetNotice, sendSMS } from "../services/notificationService.js";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
const REFRESH_COOKIE = "tn16_refresh_token";

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
  joinedAt: user.createdAt,
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
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if email already exists (enforce one account per email)
    const exist = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (exist) {
      return res.status(400).json({ message: "An account with this email already exists. Please use a different email or log in." });
    }
    
    // Mobile number is optional, but if provided, must be valid and unique
    let cleanedMobile = null;
    if (mobileNumber && mobileNumber.trim()) {
      cleanedMobile = mobileNumber.replace(/^\+91/, "").replace(/\D/g, "");
      if (cleanedMobile.length !== 10 || !/^[6-9]/.test(cleanedMobile)) {
        return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number" });
      }
      const mobileExists = await User.findOne({ where: { mobileNumber: cleanedMobile } });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }

    const user = await User.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password, 
      mobileNumber: cleanedMobile 
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
        .json({ message: "Email/mobile and password are required" });
    }

    // Validate identifier format
    const trimmed = identifier.trim();
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed);
    const isMobile = /^(\+91)?[6-9]\d{9}$/.test(trimmed.replace(/^\+91/, "").replace(/\D/g, ""));

    if (!isEmail && !isMobile) {
      return res.status(400).json({ message: "Please enter a valid email or mobile number" });
    }

    // Find user by email or mobile
    const whereClause = isEmail
      ? { email: trimmed.toLowerCase() }
      : { mobileNumber: trimmed.replace(/^\+91/, "").replace(/\D/g, "") };
    
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({ message: "Invalid email/mobile or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email/mobile or password" });
    }

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

    const now = new Date();
    const otpWindowMs = 10 * 60 * 1000; // 10 minutes
    const otpResendCooldownMs = 60 * 1000; // 60 seconds

    // Rate limit: max 5 OTP requests per identifier (email) per 10 minutes.
    // (Requirement: per email. We still key by `identifier` to cover both email + mobile safely.)
    const rateLimitWindowStart = new Date(Date.now() - otpWindowMs);
    const requestsCount = await OtpToken.count({
      where: {
        identifier,
        method,
        createdAt: { [Op.gte]: rateLimitWindowStart },
      },
    });
    if (requestsCount >= 5) {
      return res.status(429).json({
        message: "Too many OTP requests. Please try again later.",
      });
    }

    // Resend cooldown: prevent re-sending within 60 seconds for the same identifier.
    const lastOtp = await OtpToken.findOne({
      where: { identifier, method },
      order: [["createdAt", "DESC"]],
    });
    if (lastOtp?.createdAt) {
      const elapsed = Date.now() - lastOtp.createdAt.getTime();
      if (elapsed < otpResendCooldownMs) {
        const secondsLeft = Math.ceil((otpResendCooldownMs - elapsed) / 1000);
        return res.status(429).json({
          message: `Please wait ${secondsLeft}s before requesting a new OTP.`,
        });
      }
    }

    // Generate 6-digit OTP (never store plaintext).
    const otp = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .padStart(6, "0");
    const expiresAt = new Date(Date.now() + otpWindowMs);

    // SHA256 hash, then truncate to fit existing DB column size.
    const hashedOtpFull = crypto.createHash("sha256").update(otp).digest("hex");
    const hashedOtp = hashedOtpFull.slice(0, 6);

    // Expire older OTPs (keep records for rate limit window).
    await OtpToken.update(
      { expiresAt: now },
      { where: { identifier, method, verified: false } }
    );

    await OtpToken.create({
      hashedOtp,
      identifier,
      method,
      expiresAt,
      failedAttempts: 0,
      verified: false,
    });

    // Send OTP (email via Nodemailer Gmail SMTP).
    if (method === "email") {
      const { EMAIL_USER, EMAIL_PASS } = process.env;
      if (!EMAIL_USER || !EMAIL_PASS) {
        return res
          .status(500)
          .json({ message: "Email service not configured. Please contact support." });
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: EMAIL_USER,
          to: identifier,
          subject: "Your TNEXT™ Registration OTP",
          html: `
            <div style="font-family: Arial, sans-serif; color: #111827;">
              <h2>Your OTP for TNEXT™ Registration</h2>
              <p>Your OTP is: <strong style="font-size:24px;letter-spacing:4px">${otp}</strong></p>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (sendError) {
        return res.status(500).json({
          message: "Failed to send OTP. Please try again later or contact support.",
        });
      }
    } else {
      const sent = await sendSMS({
        to: identifier,
        body: `Your TNEXT™ registration OTP is ${otp}. Valid for 10 minutes.`,
      });
      if (!sent) {
        return res.status(500).json({
          message: "Failed to send OTP. Please try again later or contact support.",
        });
      }
    }

    // Never return OTP in API responses.
    res.json({ success: true, message: "OTP sent successfully." });
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

    const otpInput = String(otp).trim();
    if (!/^\d{6}$/.test(otpInput)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const method = identifier.includes("@") ? "email" : "mobile";
    const now = new Date();

    // Load most recent active OTP token.
    const otpRecord = await OtpToken.findOne({
      where: {
        identifier,
        method,
        verified: false,
        expiresAt: { [Op.gt]: now },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash user input for constant-time comparison (we still do a simple equality).
    const hashedOtpFull = crypto.createHash("sha256").update(otpInput).digest("hex");
    const hashedOtp = hashedOtpFull.slice(0, 6);

    if (otpRecord.hashedOtp !== hashedOtp) {
      const nextFailed = (otpRecord.failedAttempts || 0) + 1;
      otpRecord.failedAttempts = nextFailed;
      if (nextFailed >= 5) {
        otpRecord.expiresAt = now;
      }
      await otpRecord.save();

      if (nextFailed >= 5) {
        return res.status(429).json({
          message: "Too many invalid OTP attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Delete OTP after successful verification.
    await otpRecord.destroy();

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
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password, 
      mobileNumber: mobileNumber ? mobileNumber.replace(/^\+91/, "").replace(/\D/g, "") : null 
    });

    // Issue tokens for automatic login after registration
    const tokens = await issueTokensForUser(user, res);

    res.status(201).json({
      success: true,
      message: "Registration successful",
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
