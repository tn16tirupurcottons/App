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
    name: "Men's Wear",
    slug: "mens-wear",
    heroImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    accentColor: "#0f172a",
  },
  {
    name: "Women's Wear",
    slug: "womens-wear",
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
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    heroImage:
      "https://images.unsplash.com/photo-1505696722531-002a82b34181?auto=format&fit=crop&w=900&q=80",
    accentColor: "#d4a574",
  },
  {
    name: "Western Wear",
    slug: "western-wear",
    heroImage:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=900&q=80",
    accentColor: "#475569",
  },
  {
    name: "Casual Wear",
    slug: "casual-wear",
    heroImage:
      "https://images.unsplash.com/photo-1506629082632-421bfe45569e?auto=format&fit=crop&w=900&q=80",
    accentColor: "#64748b",
  },
  {
    name: "Formal Wear",
    slug: "formal-wear",
    heroImage:
      "https://images.unsplash.com/photo-1514886291840-2e0a9bf2a9ae?auto=format&fit=crop&w=900&q=80",
    accentColor: "#1e293b",
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    heroImage:
      "https://images.unsplash.com/photo-1539008588435-c68697784152?auto=format&fit=crop&w=900&q=80",
    accentColor: "#f97316",
  },
  {
    name: "Summer Collection",
    slug: "summer-wear",
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    accentColor: "#fbbf24",
  },
  {
    name: "Winter Collection",
    slug: "winter-wear",
    heroImage:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80",
    accentColor: "#3b82f6",
  },
];

const productNames = {
  "mens-wear": ["Slim Fit Shirt","Casual Shirt","Formal Shirt","Denim Shirt","Linen Shirt","Polo Shirt","T-Shirt","Henley Shirt","Oxford Shirt","Chino Pants","Casual Jacket","Blazer","Hoodie","Sweater","Cargo Pants","Jeans","Short Sleeve Tee","Full Sleeve Shirt","Premium Cotton Shirt","Urban Wear"],
  "womens-wear": ["Floral Dress","Party Dress","Maxi Dress","Kurti Set","Designer Dress","Summer Dress","Cocktail Dress","Evening Gown","Casual Shirt","Blouse","Saree","Lehenga","Salwar Top","Ethnic Suit","Palazzo Pants","Jeans","Cardigan","Sweater Dress","Sundress","Designer Top"],
  "kids-wear": ["Boys T-Shirt","Girls Dress","Kids Wear Set","Cartoon Print Tee","School Uniform","Party Wear Dress","Casual Shorts","Jogger Pants","Hoodie Jacket","Denim Jacket","Summer Dress","Ethnic Wear","Sports Shirt","Casual Dress","Printed Tee","Windbreaker Jacket","Jersey Shirt","Playsuit","Party Suit","Trendy Outfit"],
  "ethnic-wear": ["Traditional Saree","Lehenga Choli","Anarkali Suit","Salwar Kameez","Kurta Pajama","Silk Saree","Embroidered Suit","Chikankari Kurta","Bandhani Dress","Block Print Saree","Tiered Skirt","Traditional Blouse","Gharara","Sharara","Chaniya Choli","Dhoti Kurta","Silk Dupatta","Embellished Dress","Festival Wear","Heritage Collection"],
  "western-wear": ["Denim Jeans","Casual T-Shirt","Button-Up Shirt","Leather Jacket","Denim Jacket","Cargo Pants","Shorts","Hoodie","Sweatshirt","Sneaker Outfit","Bomber Jacket","Flannel Shirt","Tank Top","Skirt","Casual Blazer","Joggers","Jumpsuit","Kaftan","Dungarees","Street Style"],
  "casual-wear": ["Casual Shirt","Comfortable Tee","Lounge Pants","Relaxed Fit Tee","Cotton Saree","Comfort Dress","Weekend Wear","Work From Home","Casual Pants","Slip-On Jacket","Relaxed Shirt","Casual Shorts","Hoodie Tee","Casual Kurta","Comfortable Dress","Soft Cotton Shirt","Casual Skirt","Linen Pants","Comfort Top","Easy Breezy Wear"],
  "formal-wear": ["Formal Shirt","Dress Pants","Blazer Jacket","Formal Suit","Dress Shoes","Saree","Formal Gown","Executive Suit","Formal Kurta","Tie","Dress Coat","Formal Blouse","Pencil Skirt","Formal Dress","Professional Wear","Office Suit","Formal Top","Black Formal Dress","Corporate Outfit","Premium Formal"],
  "party-wear": ["Evening Gown","Cocktail Dress","Party Dress","Sequin Dress","Art Silk Saree","Lehenga Top","Silk Dress","Glamour Outfit","Festival Wear","Velvet Dress","Embellished Gown","Satin Dress","Beaded Dress","Party Suit","Festive Outfit","Celebration Dress","Luxury Wear","Designer Dress","Elegant Gown","Statement Dress"],
  "summer-wear": ["Summer Dress","Light Shirt","Linen Dress","Cotton Saree","Sleeveless Dress","Summer Shorts","Light Pants","Breathable Tee","Sun Dress","Beach Wear","White Cotton Shirt","Summer Kurta","Light Jacket","Breezy Dress","Cool Shirt","Summer Top","Light Blouse","Cotton Dress","Summer Skirt","Heat-Friendly Outfit"],
  "winter-wear": ["Winter Jacket","Sweater","Wool Coat","Shawl","Scarf","Thermal Wear","Hoodie","Fleece Jacket","Cardigan","Wool Pants","Warm Dress","Wool Saree","Waistcoat","Pullover","Winter Kurta","Quilted Jacket","Thermal Shirt","Chunky Knit","Warm Leggings","Cozy Outfit"]
};

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

const generateProduct = (i, category) => {
  const baseName = productNames[category.slug][i % productNames[category.slug].length];
  const color = random(colors);
  const gallery = Array.from({ length: 3 }, (_, idx) => {
    return `https://images.unsplash.com/photo-152${randInt(
      100,
      999
    )}?auto=format&fit=crop&w=900&q=80&sig=${i}-${idx}`;
  });

  return {
    id: uuidv4(),
    name: baseName,
    slug: `${baseName.toLowerCase().replace(/\s+/g, "-")}-${i}`,
    sku: `TN16-${randInt(1000, 9999)}`,
    shortDescription: "Handcrafted cotton decor direct from Tirupur mills.",
    description: `Premium Tirupur cotton outfit (${baseName}) stitched for all-day comfort. Breathable weave, soft finish and elevated silhouettes inspired by high-street labels.`,
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
    categoryId: category.id,
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
    categoryRows.forEach((catRow) => {
      for (let i = 0; i < 10; i++) {
        items.push(generateProduct(i, catRow));
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
