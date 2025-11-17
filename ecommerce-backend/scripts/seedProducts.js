// scripts/seedProducts.js

import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/db.js"; // Correct DB connection
import Product from "../models/Product.js"; // Product model
import Category from "../models/Category.js";
import { v4 as uuidv4 } from "uuid";

// ====== DATA SOURCES ======
const categories = [
  {
    name: "Men's Shirts",
    slug: "mens-shirts",
    heroImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    accentColor: "#0f172a",
  },
  {
    name: "Women Kurtas",
    slug: "women-kurtas",
    heroImage:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80",
    accentColor: "#be123c",
  },
  {
    name: "Kids Wear",
    slug: "kids-wear",
    heroImage:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    accentColor: "#0ea5e9",
  },
  {
    name: "Athleisure",
    slug: "athleisure",
    heroImage:
      "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=900&q=80",
    accentColor: "#10b981",
  },
  {
    name: "Accessories",
    slug: "accessories",
    heroImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    accentColor: "#f97316",
  },
];
const brands = ["TN16", "CottonCo", "LoomCraft", "DailyWear"];
const sizes = ["S", "M", "L", "XL"];
const colors = ["White", "Black", "Blue", "Pink", "Green"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ====== PRODUCT GENERATOR ======
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const generateProduct = (i, categoryId) => {
  const name = `TN16 Cotton Drop ${i + 1}`;
  const color = random(colors);
  const gallery = Array.from({ length: 3 }, (_, idx) => {
    return `https://images.unsplash.com/photo-152${randInt(
      100,
      999
    )}?auto=format&fit=crop&w=900&q=80&sig=${i}-${idx}`;
  });

  return {
    id: uuidv4(),
    name,
    slug: `${slugify(name)}-${i + 1}`,
    sku: `TN16-${randInt(1000, 9999)}`,
    shortDescription: "Handcrafted cotton decor direct from Tirupur mills.",
    description: `Premium Tirupur cotton outfit (${name}) stitched for all-day comfort. Breathable weave, soft finish and elevated silhouettes inspired by high-street labels.`,
    price: Number(randInt(389, 2999)),
    discount: random([0, 5, 10, 15, 20]),
    brand: random(brands),
    inventory: randInt(5, 30),
    sizes: sizes.sort(() => 0.5 - Math.random()).slice(0, randInt(2, 4)),
    colors: [color, random(colors)].filter(
      (val, idx, arr) => arr.indexOf(val) === idx
    ),
    thumbnail: gallery[0],
    gallery,
    tags: ["cotton", "tirupur", "tn16"],
    categoryId,
    isFeatured: Math.random() > 0.6,
  };
};

// ====== SEED SCRIPT ======
const seed = async () => {
  try {
    console.log("🔄 Connecting DB...");
    await sequelize.authenticate();

    console.log("🧹 Clearing old data (cascade truncate)...");
    await sequelize.query(`
      TRUNCATE "OrderItems", "Orders", "Carts", "Products", "Categories"
      RESTART IDENTITY CASCADE;
    `);

    console.log("🧱 Creating base categories...");
    const categoryRows = await Category.bulkCreate(
      categories.map((cat) => ({
        id: uuidv4(),
        ...cat,
        description: `${cat.name} edits from TN16 Tirupur Cotton.`,
      })),
      { returning: true }
    );

    console.log("🚀 Generating products...");
    const items = [];
    categoryRows.forEach((catRow, idx) => {
      for (let i = 0; i < 10; i++) {
        items.push(generateProduct(idx * 10 + i, catRow.id));
      }
    });

    console.log("💾 Inserting products...");
    await Product.bulkCreate(items);

    console.log(`✅ DONE → Seeded Products: ${items.length}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
};

seed();
