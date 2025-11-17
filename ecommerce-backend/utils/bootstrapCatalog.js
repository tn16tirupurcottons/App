import slugify from "./slugify.js";
import { Category, Product } from "../models/index.js";

const baseCategories = [
  {
    name: "Men",
    slug: "mens-shirts",
    description: "Signature shirts, polos and breathable staples for men.",
    heroImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#0f172a",
  },
  {
    name: "Women",
    slug: "women-kurtas",
    description: "Handloom kurtas, dresses and co-ord sets for women.",
    heroImage:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#be185d",
  },
  {
    name: "Kids",
    slug: "kids-wear",
    description: "Play-proof coordinates and festive cotton fits for kids.",
    heroImage:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#0ea5e9",
  },
  {
    name: "Gen Z",
    slug: "genz",
    description: "Neon athleisure and varsity inspired staples.",
    heroImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#7c3aed",
  },
  {
    name: "Athleisure",
    slug: "athleisure",
    description: "Performance fabrics blended with Tirupur cotton.",
    heroImage:
      "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#10b981",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Caps, socks, scarves and utility bags.",
    heroImage:
      "https://images.unsplash.com/photo-1484506097116-1bcba4c0c49b?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f97316",
  },
];

const baseProducts = [
  {
    name: "Heritage Cuban Shirt",
    price: 1899,
    discount: 200,
    brand: "TN16",
    categorySlug: "mens-shirts",
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
    categorySlug: "women-kurtas",
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

