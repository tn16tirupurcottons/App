/** Canonical shop URLs — map API category slugs to first-class routes. */
const SLUG_TO_PATH = {
  men: "/men",
  women: "/women",
  kids: "/kids",
  accessories: "/accessories",
  "mens-shirts": "/men",
  "women-kurtas": "/women",
  "kids-wear": "/kids",
  athleisure: "/catalog?category=athleisure",
  "tn16-legacy": "/catalog?category=tn16-legacy",
};

/**
 * @param {string} [slug] — category slug from API
 * @returns {string} path for React Router
 */
export function getShopPathForCategorySlug(slug) {
  if (!slug || String(slug).toLowerCase() === "all") return "/catalog";
  const key = String(slug).toLowerCase();
  return SLUG_TO_PATH[key] || `/catalog?category=${encodeURIComponent(slug)}`;
}

/** Segment keys from CMS / mega-menu → first-class routes when available. */
export function getSegmentShopPath(segmentKey) {
  const k = String(segmentKey || "").toLowerCase();
  if (k === "men") return "/men";
  if (k === "women") return "/women";
  if (k === "kids") return "/kids";
  if (k === "accessories") return "/accessories";
  return `/catalog?segment=${encodeURIComponent(segmentKey)}`;
}
