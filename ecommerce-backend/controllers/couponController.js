import Coupon from "../models/Coupon.js";
import { applyCouponPreview, getCartSubtotalForUser, getEligibleCouponsForUser } from "../services/couponService.js";
import { ensureInsiderUpgraded } from "../services/insiderService.js";
import { User } from "../models/index.js";

const normalizeBoolean = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  return Boolean(v);
};

const normalizeCouponCode = (code) => String(code || "").trim().toUpperCase();

const asDateOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body || {};

    // VALIDATION: code is required
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, message: "Valid coupon code is required" });
    }

    const normalizedCode = normalizeCouponCode(code);
    if (normalizedCode.length === 0 || normalizedCode.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid coupon code format" });
    }

    // Ensure cart and compute cart subtotal server-side.
    const { subtotal } = await getCartSubtotalForUser(req.user.id);
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Keep insider status fresh (so insider-only coupons behave correctly).
    await ensureInsiderUpgraded(req.user.id);
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const result = await applyCouponPreview({
      code: normalizedCode,
      user,
      cartSubtotal: subtotal,
    });

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({ 
      success: true,
      final_total: result.final_total, 
      discount: result.discount_amount 
    });
  } catch (err) {
    console.error("Apply coupon error:", err);
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ success: false, message: err.message || "Failed to apply coupon" });
  }
};

export const getEligibleCoupons = async (req, res, next) => {
  try {
    const { subtotal } = await getCartSubtotalForUser(req.user.id);
    await ensureInsiderUpgraded(req.user.id);
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const eligible = await getEligibleCouponsForUser(req.user.id, { cartSubtotal: subtotal });
    res.json({ success: true, items: eligible });
  } catch (err) {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ message: err.message || "Failed to load eligible coupons" });
  }
};

const validateCouponFields = (payload, { isUpdate = false } = {}) => {
  const {
    code,
    discount_type,
    discount_value,
    max_discount,
    min_order_amount,
    is_insider_only,
    usage_limit,
    expires_at,
    is_active,
  } = payload || {};

  if (!isUpdate && !code) throw new Error("code is required");
  if (isUpdate && code !== undefined && String(code).trim() === "") throw new Error("Invalid code");

  const normalizedDiscountType = String(discount_type || "").trim();
  if (!normalizedDiscountType) throw new Error("discount_type is required");
  if (!["percentage", "flat"].includes(normalizedDiscountType)) throw new Error("discount_type must be 'percentage' or 'flat'");

  const dv = Number(discount_value);
  if (!Number.isFinite(dv) || dv <= 0) throw new Error("discount_value must be greater than 0");

  const mo = Number(min_order_amount);
  if (!Number.isFinite(mo) || mo < 0) throw new Error("min_order_amount must be 0 or greater");

  const ul = usage_limit == null || usage_limit === "" ? null : Number(usage_limit);
  if (ul != null && (!Number.isFinite(ul) || ul < 1)) throw new Error("usage_limit must be null or >= 1");

  const md = max_discount == null || max_discount === "" ? null : Number(max_discount);
  if (md != null && (!Number.isFinite(md) || md < 0)) throw new Error("max_discount must be null or >= 0");

  if (is_insider_only !== undefined && !["true", "false", true, false].includes(is_insider_only)) {
    throw new Error("is_insider_only must be boolean");
  }

  const exp = expires_at == null || expires_at === "" ? null : asDateOrNull(expires_at);
  if (expires_at && !exp) throw new Error("Invalid expires_at date");

  if (is_active !== undefined && !["true", "false", true, false].includes(is_active)) {
    throw new Error("is_active must be boolean");
  }

  return {
    code,
    discount_type: normalizedDiscountType,
    discount_value: dv,
    max_discount: md,
    min_order_amount: mo,
    is_insider_only: normalizeBoolean(is_insider_only ?? false),
    usage_limit: ul,
    expires_at: exp,
    is_active: normalizeBoolean(is_active ?? true),
  };
};

export const adminCreateCoupon = async (req, res, next) => {
  try {
    const data = validateCouponFields(req.body, { isUpdate: false });
    const payload = {
      code: normalizeCouponCode(data.code),
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount: data.max_discount,
      min_order_amount: data.min_order_amount,
      is_insider_only: data.is_insider_only,
      usage_limit: data.usage_limit,
      expires_at: data.expires_at,
      is_active: data.is_active,
    };

    const created = await Coupon.create(payload);
    res.status(201).json({ success: true, coupon: created });
  } catch (err) {
    const status = err.statusCode || err.status || 400;
    const message =
      err?.name === "SequelizeUniqueConstraintError"
        ? "Coupon code already exists"
        : err.message || "Failed to create coupon";
    res.status(status).json({ message });
  }
};

export const adminUpdateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    // Validate fields; allow partial update by requiring all fields from admin form.
    const data = validateCouponFields({ ...req.body }, { isUpdate: true });

    const updates = {
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount: data.max_discount,
      min_order_amount: data.min_order_amount,
      is_insider_only: data.is_insider_only,
      usage_limit: data.usage_limit,
      expires_at: data.expires_at,
      is_active: data.is_active,
    };

    if (req.body.code !== undefined) {
      updates.code = normalizeCouponCode(req.body.code);
    }

    await coupon.update(updates);
    res.json({ success: true, coupon });
  } catch (err) {
    const status = err.statusCode || err.status || 400;
    const message =
      err?.name === "SequelizeUniqueConstraintError"
        ? "Coupon code already exists"
        : err.message || "Failed to update coupon";
    res.status(status).json({ message });
  }
};

export const adminListCoupons = async (_req, res, next) => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, items: coupons });
  } catch (err) {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ message: err.message || "Failed to list coupons" });
  }
};

