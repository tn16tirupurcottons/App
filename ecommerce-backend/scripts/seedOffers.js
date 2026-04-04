import dotenv from "dotenv";
dotenv.config();

import { Product } from "../models/index.js";

const seedOffers = async () => {
  try {
    console.log("🎁 Seeding offer products...");

    // Get all active products
    const products = await Product.findAll({
      where: { status: "active" },
      limit: 20,
    });

    if (products.length === 0) {
      console.log("⚠️ No products found to mark as offers.");
      return;
    }

    // Mark products with different offer tags and discounts
    const offerConfigs = [
      { discount: 40, offerTag: "extra-40-off", isOnOffer: true },
      { discount: 35, offerTag: "summer-sale", isOnOffer: true },
      { discount: 25, offerTag: "limited-time", isOnOffer: true },
      { discount: 50, offerTag: "flash-sale", isOnOffer: true },
    ];

    let count = 0;
    for (let i = 0; i < products.length; i++) {
      const config = offerConfigs[i % offerConfigs.length];
      const updatedProduct = await products[i].update({
        discount: config.discount,
        isOnOffer: config.isOnOffer,
        offerTag: config.offerTag,
        discountPercentage: config.discount,
      });
      count++;
    }

    console.log(`✅ Marked ${count} products as offers!`);
  } catch (err) {
    console.error("❌ Error seeding offers:", err);
  }
};

seedOffers()
  .then(() => {
    console.log("✅ Offer seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
