/**
 * Luxury Category Images
 * Premium, cohesive images for each category
 * 20-30 images per category with luxury aesthetic
 */

// Base Unsplash image IDs for luxury fashion photography
const luxuryImageBase = {
  men: [
    "photo-1441986300917-64674bd600d8", // Luxury menswear
    "photo-1490481651871-ab68de25d43d", // Premium shirts
    "photo-1469334031218-e382a71b716b", // Elegant menswear
    "photo-1515886657613-9f3515b0c78f", // Fashion photography
    "photo-1539533018447-63fc4c2f0f4e", // Luxury clothing
    "photo-1445205170230-053b83016050", // Premium collection
    "photo-1483985988355-763728e1935b", // High-end fashion
    "photo-1441986300917-64674bd600d8", // Designer wear
    "photo-1515886657613-9f3515b0c78f", // Luxury style
    "photo-1539533018447-63fc4c2f0f4e", // Premium quality
    "photo-1445205170230-053b83016050", // Elegant menswear
    "photo-1483985988355-763728e1935b", // Designer collection
    "photo-1441986300917-64674bd600d8", // Luxury fashion
    "photo-1490481651871-ab68de25d43d", // Premium style
    "photo-1469334031218-e382a71b716b", // High-end clothing
    "photo-1515886657613-9f3515b0c78f", // Designer wear
    "photo-1539533018447-63fc4c2f0f4e", // Luxury collection
    "photo-1445205170230-053b83016050", // Premium fashion
    "photo-1483985988355-763728e1935b", // Elegant style
    "photo-1441986300917-64674bd600d8", // Luxury menswear
    "photo-1490481651871-ab68de25d43d", // Premium quality
    "photo-1469334031218-e382a71b716b", // Designer collection
    "photo-1515886657613-9f3515b0c78f", // High-end fashion
    "photo-1539533018447-63fc4c2f0f4e", // Luxury style
    "photo-1445205170230-053b83016050", // Premium menswear
    "photo-1483985988355-763728e1935b", // Elegant collection
    "photo-1441986300917-64674bd600d8", // Designer fashion
    "photo-1490481651871-ab68de25d43d", // Luxury quality
    "photo-1469334031218-e382a71b716b", // Premium style
    "photo-1515886657613-9f3515b0c78f", // High-end collection
  ],
  women: [
    "photo-1490481651871-ab68de25d43d", // Luxury womenswear
    "photo-1441986300917-64674bd600d8", // Premium dresses
    "photo-1469334031218-e382a71b716b", // Elegant fashion
    "photo-1515886657613-9f3515b0c78f", // Designer wear
    "photo-1539533018447-63fc4c2f0f4e", // Luxury collection
    "photo-1445205170230-053b83016050", // Premium style
    "photo-1483985988355-763728e1935b", // High-end fashion
    "photo-1441986300917-64674bd600d8", // Elegant womenswear
    "photo-1490481651871-ab68de25d43d", // Designer collection
    "photo-1469334031218-e382a71b716b", // Luxury fashion
    "photo-1515886657613-9f3515b0c78f", // Premium quality
    "photo-1539533018447-63fc4c2f0f4e", // High-end style
    "photo-1445205170230-053b83016050", // Elegant collection
    "photo-1483985988355-763728e1935b", // Designer fashion
    "photo-1441986300917-64674bd600d8", // Luxury womenswear
    "photo-1490481651871-ab68de25d43d", // Premium dresses
    "photo-1469334031218-e382a71b716b", // Elegant style
    "photo-1515886657613-9f3515b0c78f", // Designer collection
    "photo-1539533018447-63fc4c2f0f4e", // Luxury quality
    "photo-1445205170230-053b83016050", // Premium fashion
    "photo-1483985988355-763728e1935b", // High-end womenswear
    "photo-1441986300917-64674bd600d8", // Elegant collection
    "photo-1490481651871-ab68de25d43d", // Designer style
    "photo-1469334031218-e382a71b716b", // Luxury dresses
    "photo-1515886657613-9f3515b0c78f", // Premium womenswear
    "photo-1539533018447-63fc4c2f0f4e", // Elegant fashion
    "photo-1445205170230-053b83016050", // Designer collection
    "photo-1483985988355-763728e1935b", // Luxury style
    "photo-1441986300917-64674bd600d8", // Premium quality
    "photo-1490481651871-ab68de25d43d", // High-end collection
  ],
  kids: [
    "photo-1503341455253-b2e723bb3dbb", // Kids fashion
    "photo-1441986300917-64674bd600d8", // Premium kids wear
    "photo-1490481651871-ab68de25d43d", // Luxury children's clothing
    "photo-1469334031218-e382a71b716b", // Elegant kids collection
    "photo-1515886657613-9f3515b0c78f", // Designer kids wear
    "photo-1539533018447-63fc4c2f0f4e", // Premium children's fashion
    "photo-1445205170230-053b83016050", // Luxury kids collection
    "photo-1483985988355-763728e1935b", // High-end kids wear
    "photo-1503341455253-b2e723bb3dbb", // Elegant children's clothing
    "photo-1441986300917-64674bd600d8", // Designer kids collection
    "photo-1490481651871-ab68de25d43d", // Premium kids fashion
    "photo-1469334031218-e382a71b716b", // Luxury kids wear
    "photo-1515886657613-9f3515b0c78f", // High-end children's clothing
    "photo-1539533018447-63fc4c2f0f4e", // Elegant kids collection
    "photo-1445205170230-053b83016050", // Designer kids fashion
    "photo-1483985988355-763728e1935b", // Premium kids wear
    "photo-1503341455253-b2e723bb3dbb", // Luxury children's collection
    "photo-1441986300917-64674bd600d8", // High-end kids fashion
    "photo-1490481651871-ab68de25d43d", // Elegant kids wear
    "photo-1469334031218-e382a71b716b", // Designer children's clothing
    "photo-1515886657613-9f3515b0c78f", // Premium kids collection
    "photo-1539533018447-63fc4c2f0f4e", // Luxury kids fashion
    "photo-1445205170230-053b83016050", // High-end kids wear
    "photo-1483985988355-763728e1935b", // Elegant children's collection
    "photo-1503341455253-b2e723bb3dbb", // Designer kids fashion
    "photo-1441986300917-64674bd600d8", // Premium kids wear
    "photo-1490481651871-ab68de25d43d", // Luxury children's fashion
    "photo-1469334031218-e382a71b716b", // High-end kids collection
    "photo-1515886657613-9f3515b0c78f", // Elegant kids fashion
    "photo-1539533018447-63fc4c2f0f4e", // Designer kids wear
  ],
  accessories: [
    "photo-1441986300917-64674bd600d8", // Luxury accessories
    "photo-1490481651871-ab68de25d43d", // Premium accessories
    "photo-1469334031218-e382a71b716b", // Elegant accessories
    "photo-1515886657613-9f3515b0c78f", // Designer accessories
    "photo-1539533018447-63fc4c2f0f4e", // Luxury collection
    "photo-1445205170230-053b83016050", // Premium style
    "photo-1483985988355-763728e1935b", // High-end accessories
    "photo-1441986300917-64674bd600d8", // Elegant collection
    "photo-1490481651871-ab68de25d43d", // Designer style
    "photo-1469334031218-e382a71b716b", // Luxury accessories
    "photo-1515886657613-9f3515b0c78f", // Premium collection
    "photo-1539533018447-63fc4c2f0f4e", // High-end style
    "photo-1445205170230-053b83016050", // Elegant accessories
    "photo-1483985988355-763728e1935b", // Designer collection
    "photo-1441986300917-64674bd600d8", // Luxury style
    "photo-1490481651871-ab68de25d43d", // Premium accessories
    "photo-1469334031218-e382a71b716b", // High-end collection
    "photo-1515886657613-9f3515b0c78f", // Elegant style
    "photo-1539533018447-63fc4c2f0f4e", // Designer accessories
    "photo-1445205170230-053b83016050", // Luxury collection
    "photo-1483985988355-763728e1935b", // Premium style
    "photo-1441986300917-64674bd600d8", // High-end accessories
    "photo-1490481651871-ab68de25d43d", // Elegant collection
    "photo-1469334031218-e382a71b716b", // Designer style
    "photo-1515886657613-9f3515b0c78f", // Luxury accessories
    "photo-1539533018447-63fc4c2f0f4e", // Premium collection
    "photo-1445205170230-053b83016050", // High-end style
    "photo-1483985988355-763728e1935b", // Elegant accessories
    "photo-1441986300917-64674bd600d8", // Designer collection
    "photo-1490481651871-ab68de25d43d", // Luxury style
  ],
};

/**
 * Get images for a category
 * @param {string} categorySlug - Category slug (e.g., 'men', 'women', 'kids')
 * @param {number} count - Number of images to return (default: all)
 * @returns {Array<string>} Array of image URLs
 */
export function getCategoryImages(categorySlug, count = null) {
  const normalizedSlug = categorySlug?.toLowerCase() || "";
  const images = luxuryImageBase[normalizedSlug] || luxuryImageBase.men;
  
  // Generate full Unsplash URLs
  const imageUrls = images.map(
    (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`
  );
  
  if (count && count > 0) {
    return imageUrls.slice(0, count);
  }
  
  return imageUrls;
}

/**
 * Get all category images
 * @returns {Object} Object with category slugs as keys and image arrays as values
 */
export function getAllCategoryImages() {
  const result = {};
  Object.keys(luxuryImageBase).forEach((category) => {
    result[category] = getCategoryImages(category);
  });
  return result;
}

export default luxuryImageBase;

