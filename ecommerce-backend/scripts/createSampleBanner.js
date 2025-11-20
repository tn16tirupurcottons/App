import dotenv from "dotenv";
dotenv.config();

import { sequelize, Banner } from "../models/index.js";

const sampleBanner = {
  title: "Welcome to TN16 Tirupur Cotton",
  subtitle: "Premium Cotton Apparel Made in India",
  image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  images: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
  ],
  ctaLabel: "Shop Now",
  ctaLink: "/catalog",
  segment: "default",
  page: "home",
  position: "hero",
  displayOrder: 0,
  isActive: true,
};

async function createSampleBanner() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check if banner already exists
    const existing = await Banner.findOne({
      where: { title: sampleBanner.title },
    });

    if (existing) {
      console.log("ℹ️  Sample banner already exists, updating...");
      await existing.update(sampleBanner);
      console.log("✅ Sample banner updated!");
    } else {
      await Banner.create(sampleBanner);
      console.log("✅ Sample banner created!");
    }

    console.log("\n📋 Banner Details:");
    console.log(`   Title: ${sampleBanner.title}`);
    console.log(`   Page: ${sampleBanner.page}`);
    console.log(`   Position: ${sampleBanner.position}`);
    console.log(`   Images: ${sampleBanner.images.length}`);
    console.log(`   Active: ${sampleBanner.isActive}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createSampleBanner();

