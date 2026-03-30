import Coupon from "../models/Coupon.js";

const coupons = [
  {
    code: "TN16SAVE",
    discount_type: "percentage",
    discount_value: 25,
    max_discount: 200,
    min_order_amount: 0,
    is_insider_only: false,
    usage_limit: null,
    expires_at: null,
    is_active: true,
  },
  {
    code: "INSIDER",
    discount_type: "percentage",
    discount_value: 10,
    max_discount: 300,
    min_order_amount: 0,
    is_insider_only: true,
    usage_limit: null,
    expires_at: null,
    is_active: true,
  },
  {
    code: "FLAT100",
    discount_type: "flat",
    discount_value: 100,
    max_discount: null,
    min_order_amount: 999,
    is_insider_only: false,
    usage_limit: null,
    expires_at: null,
    is_active: true,
  },
];

export const seedCoupons = async () => {
  for (const c of coupons) {
    const normalizedCode = String(c.code || "").trim().toUpperCase();
    if (!normalizedCode) continue;
    const existing = await Coupon.findOne({ where: { code: normalizedCode } });
    if (!existing) {
      await Coupon.create({ ...c, code: normalizedCode });
      continue;
    }
    await existing.update({ ...c, code: normalizedCode });
  }
};

