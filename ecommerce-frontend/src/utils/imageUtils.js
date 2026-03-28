/**
 * Image utilities — fallbacks align with src/data/visualAssets.js
 */
import { categoryStock, heroBackdrop, stockPhoto } from "../data/visualAssets";

export const FALLBACK_IMAGES = {
  product: categoryStock.men,
  men: categoryStock.men,
  women: categoryStock.women,
  kids: categoryStock.kids,
  accessories: categoryStock.accessories,
  banner: heroBackdrop,
  category: stockPhoto("photo-1558769132-cb1aea458c5e", 1000),
  default: categoryStock.men,
};

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

  if (category) {
    const categoryLower = String(category).toLowerCase();
    if (categoryLower.includes("men") || categoryLower.includes("mens")) return FALLBACK_IMAGES.men;
    if (categoryLower.includes("women") || categoryLower.includes("womens")) return FALLBACK_IMAGES.women;
    if (categoryLower.includes("kid")) return FALLBACK_IMAGES.kids;
    if (categoryLower.includes("accessory")) return FALLBACK_IMAGES.accessories;
    if (categoryLower.includes("athleisure") || categoryLower.includes("active"))
      return categoryStock.athleisure;
  }

  const productName = String(product.name || "").toLowerCase();
  const brandName = String(product.brand || "").toLowerCase();
  if (productName.includes("men") || brandName.includes("men")) return FALLBACK_IMAGES.men;
  if (productName.includes("women") || brandName.includes("women")) return FALLBACK_IMAGES.women;
  if (productName.includes("kid") || brandName.includes("kid")) return FALLBACK_IMAGES.kids;

  return FALLBACK_IMAGES.product;
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

export function handleImageError(event, fallbackUrl = FALLBACK_IMAGES.default) {
  if (event && event.target) {
    if (event.target.src !== fallbackUrl) {
      event.target.src = fallbackUrl;
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
