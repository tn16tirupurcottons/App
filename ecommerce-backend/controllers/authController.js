import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
const REFRESH_COOKIE = "tn16_refresh_token";

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
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
    const { name, email, password } = req.body;

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password });
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
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
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
