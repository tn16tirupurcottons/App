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
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_WINDOW_MS = 10 * 60 * 1000;
const OTP_MAX_REQUESTS_PER_WINDOW = 5;
const OTP_MAX_VERIFY_ATTEMPTS = 5;

// In-memory OTP limiter state (per identifier + method).
// key -> { lastOtpSentAt: number, requestCount: number, windowStart: number }
const otpRequestState = new Map();
// key -> { attempts: number, expiresAt: number }
const otpVerifyState = new Map();

const normalizeOtpIdentifier = (identifier, method) => {
  const raw = String(identifier || "").trim();
  if (method === "email") return raw.toLowerCase();
  return raw.replace(/^\+91/, "").replace(/\D/g, "");
};

const otpStateKey = (identifier, method) =>
  `${method}:${normalizeOtpIdentifier(identifier, method)}`;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const otpEmailKey = (email) => `email:${normalizeEmail(email)}`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

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
    const { identifier, method, email: emailFromBody, mobileNumber } = req.body || {};

    if (!identifier || !method) {
      return res.status(400).json({ message: "identifier and method are required" });
    }
    if (!["email", "mobile"].includes(method)) {
      return res.status(400).json({ message: "method must be 'email' or 'mobile'" });
    }

    // Strict email validation (before generating/storing/sending OTP).
    const rawEmail = method === "email" ? identifier : emailFromBody;
    const normalizedEmail = normalizeEmail(rawEmail);
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Mobile validation (mock only; no paid SMS).
    let mobileDigits = null;
    if (mobileNumber || method === "mobile") {
      const rawMobile = mobileNumber || identifier;
      const cleaned = String(rawMobile)
        .trim()
        .replace(/^\+91/, "")
        .replace(/\D/g, "");

      if (!MOBILE_REGEX.test(cleaned)) {
        return res.status(400).json({ message: "Invalid mobile number" });
      }
      mobileDigits = cleaned;
    }

    const key = otpEmailKey(normalizedEmail); // rate-limit + verify attempts per email
    const nowMs = Date.now();
    let state = otpRequestState.get(key) || {
      lastOtpSentAt: 0,
      requestCount: 0,
      windowStart: nowMs,
    };

    // Reset request window if 10 minutes passed.
    if (nowMs - state.windowStart > OTP_WINDOW_MS) {
      state = { lastOtpSentAt: 0, requestCount: 0, windowStart: nowMs };
    }

    // Cooldown based on the last OTP request time.
    if (state.lastOtpSentAt && nowMs - state.lastOtpSentAt < OTP_COOLDOWN_MS) {
      const retryAfter = Math.ceil((OTP_COOLDOWN_MS - (nowMs - state.lastOtpSentAt)) / 1000);
      return res.status(429).json({
        message: "Too many OTP requests. Please wait 60 seconds.",
        retryAfter,
      });
    }

    // Max requests per rolling 10 min window.
    if (state.requestCount >= OTP_MAX_REQUESTS_PER_WINDOW) {
      const retryAfter = Math.max(1, Math.ceil((OTP_WINDOW_MS - (nowMs - state.windowStart)) / 1000));
      return res.status(429).json({
        message: "Too many OTP requests. Try again after some time.",
        retryAfter,
      });
    }

    // Generate 6-digit OTP (never store plaintext).
    const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, "0");
    const expiresAt = new Date(nowMs + OTP_EXPIRY_MS);

    // SHA256 hash (truncate for DB column size compatibility).
    const hashedOtpFull = crypto.createHash("sha256").update(otp).digest("hex");
    const hashedOtp = hashedOtpFull.slice(0, 6);

    // Expire older OTPs for this email (and mobile if provided).
    await OtpToken.update(
      { expiresAt: new Date(nowMs) },
      { where: { identifier: normalizedEmail, method: "email", verified: false } }
    );
    if (mobileDigits) {
      await OtpToken.update(
        { expiresAt: new Date(nowMs) },
        { where: { identifier: mobileDigits, method: "mobile", verified: false } }
      );
    }

    // Create fresh OTP tokens for both email and mobile (dual acceptance).
    await OtpToken.create({
      hashedOtp,
      identifier: normalizedEmail,
      method: "email",
      expiresAt,
      verified: false,
    });

    if (mobileDigits) {
      await OtpToken.create({
        hashedOtp,
        identifier: mobileDigits,
        method: "mobile",
        expiresAt,
        verified: false,
      });
      // Development-only mobile mock (temporary).
      console.log("MOBILE OTP:", otp);
    }

    // Update limiter state now (prevents spamming even if email fails).
    state.lastOtpSentAt = nowMs;
    state.requestCount += 1;
    state.windowStart = state.windowStart || nowMs;
    otpRequestState.set(key, state);

    otpVerifyState.set(key, { attempts: 0, expiresAt: nowMs + OTP_EXPIRY_MS });

    // Email OTP (free) via Nodemailer Gmail SMTP.
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({ message: "Email service not configured" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    });

    const otpEmailHtml = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8eaf0;">
            <tr>
              <td align="center" style="padding:22px 18px 10px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:0.5px;color:#0b0b0f;">TNEXT</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;margin-top:6px;">Premium Fashion Store</div>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 18px 0;">
                <h1 style="font-family:Arial,Helvetica,sans-serif;margin:0;font-size:20px;color:#0b0b0f;text-align:center;">Verify your account</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 18px 2px;">
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0;font-size:14px;color:#374151;text-align:center;">
                  Use this code to complete your registration
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:14px 18px;">
                <div style="display:inline-block;padding:18px 26px;border-radius:14px;background:#0b0b0f;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:800;letter-spacing:6px;">
                  ${otp}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 18px 18px;">
                <p style="font-family:Arial,Helvetica,sans-serif;margin:0;font-size:13px;color:#6b7280;text-align:center;">
                  This OTP is valid for 10 minutes
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 18px 22px;background:#f9fafb;border-top:1px solid #eef0f6;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;text-align:center;font-weight:700;">
                  TNEXT – Premium Fashion Store
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;text-align:center;margin-top:4px;">
                  Tiruppur Cotton Specialists
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    try {
      console.log("OTP will be sent to:", normalizedEmail);
      await transporter.verify();
      await transporter.sendMail({
        from: EMAIL_USER,
        to: normalizedEmail,
        subject: "Verify your TNEXT Account",
        html: otpEmailHtml,
      });
      console.log("OTP email send status: ok");
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
      return res.status(500).json({
        message: "Failed to send OTP. Try again later.",
        error: mailError.message,
      });
    }

    res.json({ success: true, message: "OTP sent to your email", retryAfter: 60 });
  } catch (err) {
    console.error("OTP ERROR:", err);
    return res.status(500).json({
      message: "Failed to send OTP. Try again later.",
      error: err.message,
    });
  }
};

export const verifyOtpAndRegister = async (req, res, next) => {
  try {
    const { name, email, mobileNumber, password, otp, identifier } = req.body;

    if (!name || !email || !password || !otp || !identifier) {
      return res.status(400).json({ message: "name, email, password, otp, and identifier are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const otpInput = String(otp).trim();
    if (!/^\d{6}$/.test(otpInput)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    // Normalize optional mobile (no uniqueness enforcement).
    let mobileDigits = null;
    if (mobileNumber) {
      const cleaned = String(mobileNumber).trim().replace(/^\+91/, "").replace(/\D/g, "");
      if (!MOBILE_REGEX.test(cleaned)) {
        return res.status(400).json({ message: "Invalid mobile number" });
      }
      mobileDigits = cleaned;
    }

    const key = otpEmailKey(normalizedEmail);
    const now = new Date();
    const nowMs = now.getTime();

    let verifyState = otpVerifyState.get(key) || {
      attempts: 0,
      expiresAt: nowMs + OTP_EXPIRY_MS,
    };

    if (nowMs > verifyState.expiresAt) {
      verifyState = { attempts: 0, expiresAt: nowMs + OTP_EXPIRY_MS };
    }

    if (verifyState.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many invalid OTP attempts. Please request a new OTP.",
      });
    }

    // Hash user input for constant-time comparison (never store plaintext OTP).
    const hashedOtpFull = crypto.createHash("sha256").update(otpInput).digest("hex");
    const hashedOtp = hashedOtpFull.slice(0, 6);

    // Find matching OTP token for either email or mobile (same OTP).
    const otpRecordEmail = await OtpToken.findOne({
      where: {
        identifier: normalizedEmail,
        method: "email",
        verified: false,
        expiresAt: { [Op.gt]: now },
        hashedOtp,
      },
      order: [["createdAt", "DESC"]],
    });

    const otpRecordMobile =
      mobileDigits
        ? await OtpToken.findOne({
            where: {
              identifier: mobileDigits,
              method: "mobile",
              verified: false,
              expiresAt: { [Op.gt]: now },
              hashedOtp,
            },
            order: [["createdAt", "DESC"]],
          })
        : null;

    const otpRecord = otpRecordEmail || otpRecordMobile;
    if (!otpRecord) {
      verifyState.attempts += 1;
      otpVerifyState.set(key, verifyState);

      if (verifyState.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        // Cleanup tokens after max attempts.
        await OtpToken.destroy({
          where: {
            identifier: normalizedEmail,
            method: "email",
            verified: false,
            expiresAt: { [Op.gt]: now },
          },
        });
        if (mobileDigits) {
          await OtpToken.destroy({
            where: {
              identifier: mobileDigits,
              method: "mobile",
              verified: false,
              expiresAt: { [Op.gt]: now },
            },
          });
        }
        return res.status(429).json({
          message: "Too many invalid OTP attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Delete OTP after successful verification (delete both email + mobile tokens).
    await OtpToken.destroy({
      where: {
        hashedOtp,
        verified: false,
        expiresAt: { [Op.gt]: now },
        identifier: normalizedEmail,
        method: "email",
      },
    });
    if (mobileDigits) {
      await OtpToken.destroy({
        where: {
          hashedOtp,
          verified: false,
          expiresAt: { [Op.gt]: now },
          identifier: mobileDigits,
          method: "mobile",
        },
      });
    }

    otpVerifyState.delete(key);

    // Duplicate email prevention (strict message).
    const emailExists = await User.findOne({ where: { email: normalizedEmail } });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user (mobileNumber is optional). No mobile uniqueness enforcement.
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      mobileNumber: mobileDigits ? mobileDigits : null,
    });

    // Issue tokens for automatic login after registration
    const tokens = await issueTokensForUser(user, res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: toPublicUser(user),
      ...tokens,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      if (err.errors?.some((e) => e.path === "email")) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }
    next(err);
  }
};
