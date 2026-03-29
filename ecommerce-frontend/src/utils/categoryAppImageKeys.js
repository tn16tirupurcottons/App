/** Maps category slug (API or fallback) → app_images.key for category grid cards */
export const CATEGORY_SLUG_TO_IMAGE_KEY = {
  "mens-shirts": "CAT_GRID_MENS_SHIRTS",
  "women-kurtas": "CAT_GRID_WOMEN_KURTAS",
  "kids-wear": "CAT_GRID_KIDS_WEAR",
  athleisure: "CAT_GRID_ATHLEISURE",
  accessories: "CAT_GRID_ACCESSORIES",
  "tn18-legacy": "CAT_GRID_TN18_LEGACY",
  "tn18-legacy-line": "CAT_GRID_TN18_LEGACY",
};

export function slugToCategoryImageKey(slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  return CATEGORY_SLUG_TO_IMAGE_KEY[s] || null;
}
