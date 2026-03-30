import { describe, expect, it, vi } from "vitest";

// Mock DB models used by couponService eligibility checks.
vi.mock("../models/index.js", () => {
  return {
    sequelize: {
      transaction: vi.fn(),
      Transaction: { LOCK: { UPDATE: "UPDATE" } },
    },
    Coupon: {},
    CouponUsage: {
      findOne: vi.fn(async () => null),
      create: vi.fn(async () => null),
    },
    Cart: {},
    Product: {},
    User: {},
    Order: {},
  };
});

vi.mock("../services/insiderService.js", () => {
  return {
    ensureInsiderUpgraded: vi.fn(async () => null),
    toggleInsiderStatus: vi.fn(async () => null),
  };
});

const couponService = await import("../services/couponService.js");
const { computeDiscountAmount, validateCouponEligibility } = couponService;

describe("couponService.computeDiscountAmount", () => {
  it("computes percentage discount with max cap", () => {
    const coupon = {
      discount_type: "percentage",
      discount_value: 25,
      max_discount: 200,
    };
    const discount = computeDiscountAmount({ coupon, cartSubtotal: 2000 });
    expect(discount).toBe(200);
  });

  it("computes flat discount and caps at cart subtotal", () => {
    const coupon = {
      discount_type: "flat",
      discount_value: 9999,
      max_discount: null,
    };
    const discount = computeDiscountAmount({ coupon, cartSubtotal: 500 });
    expect(discount).toBe(500);
  });
});

describe("couponService.validateCouponEligibility", () => {
  it("rejects invalid coupon payload", async () => {
    const res = await validateCouponEligibility({
      coupon: null,
      user: { is_insider: false },
      cartSubtotal: 1000,
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/invalid/i);
  });

  it("rejects expired coupon", async () => {
    const coupon = {
      is_active: true,
      expires_at: new Date(Date.now() - 60000).toISOString(),
      usage_limit: null,
      used_count: 0,
      min_order_amount: 0,
      is_insider_only: false,
      id: "c1",
    };
    const res = await validateCouponEligibility({
      coupon,
      user: { is_insider: false, id: "u1" },
      cartSubtotal: 1000,
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/expired/i);
  });

  it("rejects insider-only coupon for non-insider user", async () => {
    const coupon = {
      is_active: true,
      expires_at: null,
      usage_limit: null,
      used_count: 0,
      min_order_amount: 0,
      is_insider_only: true,
      id: "c1",
    };
    const res = await validateCouponEligibility({
      coupon,
      user: { is_insider: false, id: "u1" },
      cartSubtotal: 1000,
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/insider/i);
  });

  it("rejects coupon when min_order_amount is not satisfied", async () => {
    const coupon = {
      is_active: true,
      expires_at: null,
      usage_limit: null,
      used_count: 0,
      min_order_amount: 1500,
      is_insider_only: false,
      id: "c1",
    };
    const res = await validateCouponEligibility({
      coupon,
      user: { is_insider: false, id: "u1" },
      cartSubtotal: 1000,
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/minimum/i);
  });

  it("rejects coupon when global usage_limit exceeded", async () => {
    const coupon = {
      is_active: true,
      expires_at: null,
      usage_limit: 5,
      used_count: 5,
      min_order_amount: 0,
      is_insider_only: false,
      id: "c1",
    };
    const res = await validateCouponEligibility({
      coupon,
      user: { is_insider: false, id: "u1" },
      cartSubtotal: 2000,
    });
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/limit/i);
  });
});

