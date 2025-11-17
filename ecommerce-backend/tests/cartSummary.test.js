import { describe, expect, it } from "vitest";
import { buildSummary } from "../controllers/cartController.js";

const fakeProduct = (price, discount = 0) => ({
  Product: { price, discount },
  quantity: 1,
  unitPrice: price - discount,
});

describe("buildSummary", () => {
  it("computes totals with tax and shipping", () => {
    const summary = buildSummary([
      fakeProduct(1000, 100),
      fakeProduct(800, 0),
    ]);
    expect(summary.subtotal).toBe(1700);
    expect(summary.taxTotal).toBeCloseTo(85);
    expect(summary.shippingFee).toBe(59);
    expect(summary.payable).toBe(1844);
  });

  it("waives shipping for carts above threshold", () => {
    const summary = buildSummary([fakeProduct(2200, 0)]);
    expect(summary.shippingFee).toBe(0);
  });
});

