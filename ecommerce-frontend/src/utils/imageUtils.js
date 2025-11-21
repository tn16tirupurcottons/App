/**
 * Image Utility Functions
 * Centralized image handling with fallbacks and error recovery
 */

// Fallback images by category
export const FALLBACK_IMAGES = {
  product: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  men: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  women: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  kids: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
  accessories: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
  banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80",
  category: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
};

/**
 * Get product image with fallback
 * @param {Object} product - Product object
 * @param {string} category - Optional category for category-specific fallback
 * @returns {string} Image URL
 */
export function getProductImage(product, category = null) {
  if (!product) return FALLBACK_IMAGES.default;

  // Try thumbnail first (must be valid URL)
  if (product.thumbnail && isValidImageUrl(product.thumbnail)) {
    return product.thumbnail;
  }

  // Try gallery array
  if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
    const validImage = product.gallery.find(img => img && isValidImageUrl(img));
    if (validImage) return validImage;
  }

  // Try single image field
  if (product.image && isValidImageUrl(product.image)) {
    return product.image;
  }

  // Category-specific fallback based on category name
  if (category) {
    const categoryLower = String(category).toLowerCase();
    if (categoryLower.includes("men") || categoryLower.includes("mens")) return FALLBACK_IMAGES.men;
    if (categoryLower.includes("women") || categoryLower.includes("womens")) return FALLBACK_IMAGES.women;
    if (categoryLower.includes("kid") || categoryLower.includes("kids")) return FALLBACK_IMAGES.kids;
    if (categoryLower.includes("accessory") || categoryLower.includes("accessories")) return FALLBACK_IMAGES.accessories;
  }

  // Try to infer from product name or brand
  const productName = String(product.name || "").toLowerCase();
  const brandName = String(product.brand || "").toLowerCase();
  if (productName.includes("men") || brandName.includes("men")) return FALLBACK_IMAGES.men;
  if (productName.includes("women") || brandName.includes("women")) return FALLBACK_IMAGES.women;
  if (productName.includes("kid") || brandName.includes("kid")) return FALLBACK_IMAGES.kids;

  // Default product fallback - always return a valid image
  return FALLBACK_IMAGES.product;
}

/**
 * Get category image with fallback
 * @param {Object} category - Category object
 * @returns {string} Image URL
 */
export function getCategoryImage(category) {
  if (!category) return FALLBACK_IMAGES.category;

  if (category.heroImage && isValidImageUrl(category.heroImage)) {
    return category.heroImage;
  }

  if (category.image && isValidImageUrl(category.image)) {
    return category.image;
  }

  // Category-specific fallback
  const name = (category.name || "").toLowerCase();
  if (name.includes("men")) return FALLBACK_IMAGES.men;
  if (name.includes("women")) return FALLBACK_IMAGES.women;
  if (name.includes("kid")) return FALLBACK_IMAGES.kids;
  if (name.includes("accessory")) return FALLBACK_IMAGES.accessories;

  return FALLBACK_IMAGES.category;
}

/**
 * Get banner image with fallback
 * @param {Object} banner - Banner object
 * @returns {string} Image URL
 */
export function getBannerImage(banner) {
  if (!banner) return FALLBACK_IMAGES.banner;

  if (banner.images && Array.isArray(banner.images) && banner.images.length > 0) {
    const validImage = banner.images.find(img => isValidImageUrl(img));
    if (validImage) return validImage;
  }

  if (banner.image && isValidImageUrl(banner.image)) {
    return banner.image;
  }

  return FALLBACK_IMAGES.banner;
}

/**
 * Validate image URL
 * @param {string} url - Image URL to validate
 * @returns {boolean} True if URL is valid
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.trim() === "") return false;
  
  // Check for valid URL pattern
  try {
    new URL(url);
    return true;
  } catch {
    // If URL parsing fails, check if it's a data URL
    return url.startsWith("data:image/") || url.startsWith("/");
  }
}

/**
 * Handle image error and set fallback
 * @param {Event} event - Error event
 * @param {string} fallbackUrl - Fallback image URL
 */
export function handleImageError(event, fallbackUrl = FALLBACK_IMAGES.default) {
  if (event && event.target) {
    // Prevent infinite loop if fallback also fails
    if (event.target.src !== fallbackUrl) {
      event.target.src = fallbackUrl;
      event.target.onerror = null; // Remove error handler to prevent loops
    }
  }
}

/**
 * Preload image
 * @param {string} url - Image URL to preload
 * @returns {Promise<boolean>} True if image loaded successfully
 */
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
