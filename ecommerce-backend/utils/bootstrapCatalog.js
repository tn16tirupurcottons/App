import slugify from "./slugify.js";
import { Category, Product } from "../models/index.js";

const baseCategories = [
  {
    name: "Men's Wear",
    slug: "mens-wear",
    description: "Premium shirts, casual wear and formal outfits for men.",
    heroImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#0f172a",
  },
  {
    name: "Women's Wear",
    slug: "womens-wear",
    description: "Elegant dresses, traditional wear and contemporary fashion for women.",
    heroImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#be185d",
  },
  {
    name: "Kids Wear",
    slug: "kids-wear",
    description: "Comfortable and stylish clothing for kids of all ages.",
    heroImage:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#0ea5e9",
  },
  {
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    description: "Traditional sarees, lehengas and ethnic collections.",
    heroImage:
      "https://images.unsplash.com/photo-1505696722531-002a82b34181?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#d4a574",
  },
  {
    name: "Western Wear",
    slug: "western-wear",
    description: "Denim, casual shirts and contemporary western fashion.",
    heroImage:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#475569",
  },
  {
    name: "Casual Wear",
    slug: "casual-wear",
    description: "Comfortable everyday clothing for all occasions.",
    heroImage:
      "https://images.unsplash.com/photo-1506629082632-421bfe45569e?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#64748b",
  },
  {
    name: "Formal Wear",
    slug: "formal-wear",
    description: "Professional and elegant formal clothing collection.",
    heroImage:
      "https://images.unsplash.com/photo-1514886291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#1e293b",
  },
  {
    name: "Party Wear",
    slug: "party-wear",
    description: "Vibrant party dresses and celebration outfits.",
    heroImage:
      "https://images.unsplash.com/photo-1539008588435-c68697784152?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f97316",
  },
  {
    name: "Summer Collection",
    slug: "summer-wear",
    description: "Light and breathable clothing for warm weather.",
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#fbbf24",
  },
  {
    name: "Winter Collection",
    slug: "winter-wear",
    description: "Warm and cozy winter clothing collection.",
    heroImage:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#3b82f6",
  },
];

const baseProducts = [
  {
    name: "Heritage Cuban Shirt",
    price: 1899,
    discount: 200,
    brand: "TN16",
    categorySlug: "mens-wear",
    description:
      "Relaxed Cuban collar shirt crafted in airy Tirupur cotton with corozo buttons.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue"],
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Pinstripe Kurta Set",
    price: 2499,
    discount: 0,
    brand: "TN16 Studio",
    categorySlug: "womens-wear",
    description:
      "Handloom kurta with tonal pinstripes, paired with tapered cotton trousers.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Rose", "Ivory"],
    gallery: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Organic Playtime Co-ord",
    price: 1299,
    discount: 150,
    brand: "TN16 Mini",
    categorySlug: "kids-wear",
    description:
      "Soft brushed cotton coordinate set with elastic waistband for all-day play.",
    sizes: ["2-3Y", "3-4Y", "4-5Y"],
    colors: ["Yellow", "Blue"],
    gallery: [
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "FlexMove Athleisure Hoodie",
    price: 1699,
    discount: 100,
    brand: "TN16 Move",
    categorySlug: "athleisure",
    description:
      "Moisture-wicking cotton blend hoodie with oversized silhouette and kangaroo pocket.",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Olive"],
    gallery: [
      "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Varsity Graphic Tee",
    price: 999,
    discount: 200,
    brand: "GlowLab",
    categorySlug: "genz",
    description:
      "Oversized tee with puff print graphics inspired by varsity edits.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Lavender", "Charcoal"],
    gallery: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653f1?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Jute Canvas Tote",
    price: 799,
    discount: 0,
    brand: "TN16 Accessories",
    categorySlug: "accessories",
    description:
      "Structured tote made with jute canvas and cotton lining, perfect for daily hauls.",
    sizes: ["Free"],
    colors: ["Natural"],
    gallery: [
      "https://images.unsplash.com/photo-1484506097116-1bcba4c0c49b?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

export const bootstrapCatalog = async () => {
  const categoryCount = await Category.count();
  if (categoryCount === 0) {
    await Category.bulkCreate(
      baseCategories.map((category) => ({
        ...category,
        slug: slugify(category.slug || category.name),
      }))
    );
    console.log("Seeded default categories ✅");
  }

  const productCount = await Product.count();
  if (productCount === 0) {
    const categories = await Category.findAll();
    const slugToId = categories.reduce((acc, category) => {
      acc[category.slug] = category.id;
      return acc;
    }, {});

    await Product.bulkCreate(
      baseProducts
        .map((product) => ({
          ...product,
          categoryId: slugToId[product.categorySlug],
          slug: slugify(product.name),
          sizes: product.sizes,
          colors: product.colors,
          gallery: product.gallery,
          thumbnail: product.gallery?.[0],
          inventory: 25,
          tags: ["tn16", "cotton"],
          isFeatured: true,
        }))
        .filter((product) => product.categoryId)
    );

    console.log("Seeded default products ✅");
  }
};

