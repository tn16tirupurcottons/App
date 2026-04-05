/**
 * Image utilities — fallbacks align with src/data/visualAssets.js
 */
import { categoryStock, heroBackdrop, stockPhoto } from "../data/visualAssets";

/** Stable placeholder when CDN/API image fails (Lorem Picsum, royalty-free). */
export const PICSUM_PRODUCT = (seed = "tnext") =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/600/800`;

export const FALLBACK_IMAGES = {
  product: "https://picsum.photos/600/800",
  men: categoryStock.men,
  women: categoryStock.women,
  kids: categoryStock.kids,
  accessories: categoryStock.accessories,
  banner: heroBackdrop,
  category: stockPhoto("photo-1558769132-cb1aea458c5e", 1000),
  default: "https://picsum.photos/600/800",
};

const PEXELS_PRODUCT_PHOTOS = {
  dresses: [2379004, 19090, 934070, 1108099, 2983464, 1289467],
  women: [439390, 18029, 3184312, 12019014, 853068, 247501],
  men: [428340, 838158, 1278611, 21674, 375576, 1714208],
  kids: [145869, 1738785, 2892046, 3029445, 3258769, 1227648],
  footwear: [19090, 2983464, 937481, 301705, 1048274, 2835171],
  accessories: [2956395, 19090, 936418, 631306, 712386, 1331746],
  default: [1625536, 1048274, 2255044, 3299932, 3011656, 928294],
};

function numericHash(value) {
  const str = String(value || "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function getProductQuery(product, category) {
  const safeName = String(product?.name || product?.title || "").trim();
  const safeBrand = String(product?.brand || "").trim();
  const safeCategory = String(category || product?.Category?.name || product?.category?.name || "").trim();
  const base = [safeName, safeBrand, safeCategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!base) return "luxury fashion";

  // Prioritize most descriptive terms and ensure luxury-level context
  const tokens = base
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["and", "for", "with", "the", "a", "of", "in"].includes(t));

  const key = tokens.slice(0, 3).join(" ") || base;
  return `${key} designer fashion premium`;
}

function getUnsplashSourceUrl(query, seed) {
  const encoded = encodeURIComponent(String(query || "luxury fashion").trim());
  return `https://source.unsplash.com/1600x2000/?${encoded}&sig=${seed}`;
}

function getPexelsSourceUrl(category, seed) {
  const key = String(category || "default").toLowerCase();
  const list = PEXELS_PRODUCT_PHOTOS[key] || PEXELS_PRODUCT_PHOTOS.default;
  const idx = Number(seed) % list.length;
  const id = list[idx];
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=1600&w=1200`;
}

export function getProductImage(product, category = null) {
  if (!product) return FALLBACK_IMAGES.default;

  if (product.thumbnail && isValidImageUrl(product.thumbnail)) {
    return product.thumbnail;
  }

  if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
    const validImage = product.gallery.find((img) => img && isValidImageUrl(img));
    if (validImage) return validImage;
  }

  if (product.image && isValidImageUrl(product.image)) {
    return product.image;
  }

  const productCategory = String(category || product?.Category?.name || product?.category?.name || "").toLowerCase();

  if (productCategory.includes("men") || String(product.name || "").toLowerCase().includes("men")) {
    const seed = numericHash(product.id || product.name || Date.now());
    return getPexelsSourceUrl("men", seed + 1);
  }

  if (productCategory.includes("women") || String(product.name || "").toLowerCase().includes("women")) {
    const seed = numericHash(product.id || product.name || Date.now());
    return getPexelsSourceUrl("women", seed + 2);
  }

  if (productCategory.includes("kid") || String(product.name || "").toLowerCase().includes("kid")) {
    const seed = numericHash(product.id || product.name || Date.now());
    return getPexelsSourceUrl("kids", seed + 3);
  }

  if (
    productCategory.includes("dress") ||
    productCategory.includes("ethnic") ||
    String(product.name || "").toLowerCase().includes("dress")
  ) {
    const seed = numericHash(product.id || product.name || Date.now());
    return getPexelsSourceUrl("dresses", seed + 4);
  }

  if (productCategory.includes("foot") || productCategory.includes("shoe")) {
    const seed = numericHash(product.id || product.name || Date.now());
    return getPexelsSourceUrl("footwear", seed + 5);
  }

  const seed = numericHash(product.id || product.name || Date.now());
  const dynamicQuery = getProductQuery(product, productCategory);
  const unsplashUrl = getUnsplashSourceUrl(dynamicQuery, seed);

  // Always return an image URL; rely on img onError fallback to handle real fetch issues.
  return unsplashUrl;
}

export function getCategoryImage(category) {
  if (!category) return FALLBACK_IMAGES.category;

  if (category.heroImage && isValidImageUrl(category.heroImage)) {
    return category.heroImage;
  }

  if (category.image && isValidImageUrl(category.image)) {
    return category.image;
  }

  const name = (category.name || "").toLowerCase();
  if (name.includes("men")) return FALLBACK_IMAGES.men;
  if (name.includes("women")) return FALLBACK_IMAGES.women;
  if (name.includes("kid")) return FALLBACK_IMAGES.kids;
  if (name.includes("dress") || name.includes("fashion")) return categoryStock.dressFashion;
  if (name.includes("athleisure") || name.includes("active")) return categoryStock.athleisure;
  if (name.includes("accessory")) return FALLBACK_IMAGES.accessories;

  return FALLBACK_IMAGES.category;
}

export function getBannerImage(banner) {
  if (!banner) return FALLBACK_IMAGES.banner;

  if (banner.images && Array.isArray(banner.images) && banner.images.length > 0) {
    const validImage = banner.images.find((img) => isValidImageUrl(img));
    if (validImage) return validImage;
  }

  if (banner.image && isValidImageUrl(banner.image)) {
    return banner.image;
  }

  return FALLBACK_IMAGES.banner;
}

export function normalizeImageArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim() !== "");
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim() !== "");
      }
    } catch {
      // Fallback to comma-separated strings if JSON parsing fails.
      return trimmed.split(",").map((item) => item.trim()).filter((item) => item !== "");
    }
  }

  return [];
}

export function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith("data:image/") || url.startsWith("/");
  }
}

export function handleImageError(event, fallbackUrl = FALLBACK_IMAGES.product) {
  if (event && event.target) {
    const next = fallbackUrl || FALLBACK_IMAGES.product;
    if (event.target.src !== next) {
      event.target.src = next;
      event.target.onerror = null;
    }
  }
}

export function preloadImage(url) {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
