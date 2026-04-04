import { Product } from "../models/index.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const calculateDynamicPrice = (product) => {
  if (!product) return 0;

  const base = Number(product.basePrice || product.price || 0);
  let dynamic = base;

  if (!base || base <= 0) return dynamic;

  const views = Number(product.viewsCount || 0);
  const purchases = Number(product.purchasesCount || 0);

  if (views > 100 && purchases > 20) {
    dynamic = base * 1.05;
  } else if (views > 100 && purchases < 5) {
    dynamic = base * 0.9;
  }

  // ensure no extreme discounts or spikes
  dynamic = clamp(dynamic, base * 0.7, base * 1.5);
  dynamic = Number(dynamic.toFixed(2));

  const demandRatio = views <= 0 ? 0 : purchases / views;
  const demandScore = Number(clamp(demandRatio * 100, 0, 120).toFixed(2));

  return {
    basePrice: base,
    dynamicPrice: dynamic,
    demandScore,
    lastUpdated: new Date(),
  };
};

export const runDynamicPricingUpdate = async () => {
  const products = await Product.findAll({ where: { status: "active" } });

  for (const product of products) {
    const attrs = calculateDynamicPrice(product);

    await product.update(
      {
        basePrice: attrs.basePrice,
        dynamicPrice: attrs.dynamicPrice,
        demandScore: attrs.demandScore,
        lastUpdated: attrs.lastUpdated,
      },
      { silent: true }
    );
  }

  return products.length;
};
