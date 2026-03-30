import { Op } from "sequelize";
import { sequelize, Coupon, CouponUsage, Cart, Product, User } from "../models/index.js";
import { ensureInsiderUpgraded } from "./insiderService.js";

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const calculateCartSubtotal = (items) => {
  return items.reduce((sum, item) => {
    const fallback = (item.Product?.price || 0) - (item.Product?.discount || 0);
    const unitPrice = item.unitPrice ?? fallback;
    return sum + item.quantity * safeNumber(unitPrice);
  }, 0);
};

export const getCartSubtotalForUser = async (userId, { transaction } = {}) => {
  const cartItems = await Cart.findAll({
    where: { userId },
    include: [{ model: Product, attributes: ["price", "discount"] }],
    transaction,
  });
  const subtotal = calculateCartSubtotal(cartItems);
  return { subtotal, cartItems };
};

export const computeDiscountAmount = ({ coupon, cartSubtotal }) => {
  const subtotal = safeNumber(cartSubtotal);
  const discountType = coupon.discount_type;
  const discountValue = safeNumber(coupon.discount_value);
  const maxDiscount = coupon.max_discount != null ? safeNumber(coupon.max_discount) : null;

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "flat") {
    discountAmount = discountValue;
  } else {
    throw new Error("Unsupported discount_type");
  }

  if (maxDiscount != null) discountAmount = Math.min(discountAmount, maxDiscount);
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  // Keep 2-decimal precision for money safety.
  discountAmount = Number(discountAmount.toFixed(2));
  return discountAmount;
};

export const validateCouponEligibility = async ({
  coupon,
  user,
  cartSubtotal,
  transaction,
} = {}) => {
  const now = new Date();

  if (!coupon) {
    return { ok: false, message: "Invalid coupon code" };
  }

  if (!coupon.is_active) {
    return { ok: false, message: "Coupon is not active" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) <= now) {
    return { ok: false, message: "Coupon has expired" };
  }

  if (coupon.usage_limit != null && safeNumber(coupon.used_count) >= safeNumber(coupon.usage_limit)) {
    return { ok: false, message: "This coupon usage limit has been reached" };
  }

  if (safeNumber(cartSubtotal) < safeNumber(coupon.min_order_amount)) {
    return { ok: false, message: "Minimum order amount not satisfied" };
  }

  if (coupon.is_insider_only && !user.is_insider) {
    return { ok: false, message: "This coupon is available for Insider members only" };
  }

  if (transaction) {
    const usage = await CouponUsage.findOne({
      where: { userId: user.id, couponId: coupon.id },
      transaction,
    });
    if (usage) return { ok: false, message: "Coupon already used" };
  } else {
    const usage = await CouponUsage.findOne({
      where: { userId: user.id, couponId: coupon.id },
    });
    if (usage) return { ok: false, message: "Coupon already used" };
  }

  return { ok: true };
};

/**
 * Preview-only: validates and calculates discount without consuming coupon usage.
 */
export const applyCouponPreview = async ({ code, user, cartSubtotal }) => {
  const normalizedCode = normalizeCode(code);
  const coupon = await Coupon.findOne({ where: { code: normalizedCode } });
  if (!coupon) return { ok: false, message: "Invalid coupon code" };

  const eligibility = await validateCouponEligibility({ coupon, user, cartSubtotal });
  if (!eligibility.ok) return eligibility;

  const discount = computeDiscountAmount({ coupon, cartSubtotal });
  const final_total = Number((safeNumber(cartSubtotal) - discount).toFixed(2));
  return { ok: true, final_total, discount_amount: discount, coupon_id: coupon.id };
};

/**
 * Consumes coupon usage and logs the usage. This should be called when placing an order.
 */
export const consumeCouponForUser = async ({
  code,
  userId,
  cartSubtotal,
  transaction,
} = {}) => {
  const normalizedCode = normalizeCode(code);
  const run = async (tx) => {
    const user = await User.findByPk(userId, { transaction: tx });
    if (!user) throw new Error("User not found");

    // Ensure insider status is up to date before consuming insider-only coupons.
    await ensureInsiderUpgraded(userId, { transaction: tx });

    // Lock coupon row to prevent race conditions.
    const coupon = await Coupon.findOne({
      where: { code: normalizedCode },
      transaction: tx,
      lock: sequelize.Transaction.LOCK.UPDATE,
    });

    const eligibility = await validateCouponEligibility({
      coupon,
      user,
      cartSubtotal,
      transaction: tx,
    });

    if (!eligibility.ok) {
      const err = new Error(eligibility.message);
      err.statusCode = 400;
      throw err;
    }

    const discount = computeDiscountAmount({ coupon, cartSubtotal });
    const final_total = Number((safeNumber(cartSubtotal) - discount).toFixed(2));

    await CouponUsage.create(
      {
        userId,
        couponId: coupon.id,
        cart_total: safeNumber(cartSubtotal),
        discount_amount: discount,
      },
      { transaction: tx }
    );

    coupon.used_count = safeNumber(coupon.used_count) + 1;
    await coupon.save({ transaction: tx });

    return { coupon_id: coupon.id, final_total, discount_amount: discount };
  };

  if (transaction) {
    return run(transaction);
  }

  return sequelize.transaction(async (tx) => run(tx));
};

/**
 * Returns coupons that are eligible for the user's current cart.
 */
export const getEligibleCouponsForUser = async (userId, { cartSubtotal } = {}) => {
  const user = await User.findByPk(userId);
  await ensureInsiderUpgraded(userId);

  const now = new Date();
  const coupons = await Coupon.findAll({
    where: {
      is_active: true,
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
    },
    order: [["createdAt", "DESC"]],
  });

  const result = [];
  for (const coupon of coupons) {
    // Skip quickly based on cheap checks first.
    if (coupon.usage_limit != null && safeNumber(coupon.used_count) >= safeNumber(coupon.usage_limit)) continue;
    if (safeNumber(cartSubtotal) < safeNumber(coupon.min_order_amount)) continue;
    if (coupon.is_insider_only && !user.is_insider) continue;

    const eligibility = await validateCouponEligibility({
      coupon,
      user,
      cartSubtotal,
    });
    if (!eligibility.ok) continue;

    const discount_amount = computeDiscountAmount({ coupon, cartSubtotal });
    result.push({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount,
      min_order_amount: coupon.min_order_amount,
      is_insider_only: coupon.is_insider_only,
      usage_limit: coupon.usage_limit,
      used_count: coupon.used_count,
      expires_at: coupon.expires_at,
      discount_amount_preview: discount_amount,
    });
  }

  return result;
};

