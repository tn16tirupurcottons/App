/**
 * Unique Image Generation for Products
 * Generates unique, relevant images for each product based on name and category
 */

const PEXELS_FASHION_COLLECTION = {
  dresses: [2004161, 1055691, 2020991, 1239291, 2914485, 3217156],
  women: [2020991, 1239291, 1926769, 1926877, 1926896, 2020991],
  men: [2020980, 1926827, 1616680, 2004161, 1688782, 1880174],
  shirts: [2004161, 1880174, 1688782, 2004161, 1926878, 2020957],
  kids: [1926879, 1926880, 1926881, 1926882, 1926883, 1926884],
  footwear: [2020952, 2020953, 2020954, 2020955, 2020956, 2020957],
  accessories: [2020958, 2020959, 2020960, 2020961, 2020962, 2020963],
  ethnic: [1926768, 1926769, 1926770, 1926771, 1926772, 1926773],
  default: [2020980, 2020981, 2020982, 2020983, 2020984, 2020985],
};

/**
 * Simple hash function to ensure same product name = same image
 * @param {string} str - string to hash
 * @returns {number} hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get image category from product name and category
 * @param {string} productName - name of product
 * @param {string} categoryName - category name
 * @returns {string} category key for PEXELS_FASHION_COLLECTION
 */
export function getImageCategory(productName = "", categoryName = "") {
  const name = String(productName).toLowerCase();
  const category = String(categoryName).toLowerCase();

  // Check product name for keywords
  if (name.includes("dress")) return "dresses";
  if (name.includes("shirt") || name.includes("kurta")) return "shirts";
  if (name.includes("shoe") || name.includes("sneaker") || name.includes("footwear"))
    return "footwear";
  if (name.includes("saree") || name.includes("ethnic") || name.includes("lehenga"))
    return "ethnic";

  // Check category
  if (category.includes("dress")) return "dresses";
  if (category.includes("women")) return "women";
  if (category.includes("men")) return "men";
  if (category.includes("shirt") || category.includes("top")) return "shirts";
  if (category.includes("shoe") || category.includes("foot")) return "footwear";
  if (category.includes("accessory")) return "accessories";
  if (category.includes("ethnic") || category.includes("traditional"))
    return "ethnic";
  if (category.includes("kid")) return "kids";

  return "default";
}

/**
 * Generate a unique Pexels image URL for a product
 * @param {string} productId - unique product ID
 * @param {string} productName - product name
 * @param {string} categoryName - category name
 * @returns {string} Pexels image URL
 */
export function generateUniqueProductImage(
  productId,
  productName = "",
  categoryName = ""
) {
  const imgCategory = getImageCategory(productName, categoryName);
  const photoIds = PEXELS_FASHION_COLLECTION[imgCategory] ||
    PEXELS_FASHION_COLLECTION.default;

  // Use product ID hash to consistently select same image
  const hash = simpleHash(productId);
  const photoIndex = hash % photoIds.length;
  const photoId = photoIds[photoIndex];

  // Return high-quality Pexels image
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&h=1600&w=1200`;
}

/**
 * Generate multiple unique images for a product gallery
 * Each image will be different but deterministic based on product ID
 * @param {string} productId - unique product ID
 * @param {string} productName - product name
 * @param {string} categoryName - category name
 * @param {number} count - number of images to generate (default: 3)
 * @returns {string[]} array of image URLs
 */
export function generateProductGallery(
  productId,
  productName = "",
  categoryName = "",
  count = 3
) {
  const imgCategory = getImageCategory(productName, categoryName);
  const photoIds = PEXELS_FASHION_COLLECTION[imgCategory] ||
    PEXELS_FASHION_COLLECTION.default;

  if (photoIds.length === 0) {
    return [];
  }

  const baseHash = simpleHash(productId);
  const images = [];

  for (let i = 0; i < Math.min(count, photoIds.length); i++) {
    const photoIndex = (baseHash + i) % photoIds.length;
    const photoId = photoIds[photoIndex];
    images.push(
      `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&h=1600&w=1200`
    );
  }

  return images;
}

/**
 * Ensure product has valid unique gallery
 * If gallery is empty, generates default images
 * @param {object} product - product object
 * @returns {string[]} validated gallery array
 */
export function ensureProductGallery(product) {
  if (!product) return [];

  // If gallery already exists and is valid, return it
  if (
    product.gallery &&
    Array.isArray(product.gallery) &&
    product.gallery.length > 0
  ) {
    return product.gallery.filter((img) => img && typeof img === "string");
  }

  // Generate gallery from product metadata
  return generateProductGallery(
    product.id,
    product.name,
    product.Category?.name || product.categoryName,
    3 // Default to 3 images
  );
}

/**
 * Validate and sanitize product gallery
 * Removes duplicates and invalid URLs
 * @param {string[]} gallery - array of image URLs
 * @returns {string[]} cleaned gallery
 */
export function validateProductGallery(gallery = []) {
  if (!Array.isArray(gallery)) return [];

  // Filter valid URLs and remove duplicates
  const urlSet = new Set();
  return gallery.filter((url) => {
    if (!url || typeof url !== "string" || urlSet.has(url)) {
      return false;
    }
    urlSet.add(url);
    return true;
  });
}

export default generateUniqueProductImage;
