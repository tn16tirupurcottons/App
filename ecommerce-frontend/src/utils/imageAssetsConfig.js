import { DEFAULT_IMAGE_ASSETS, PICSUM_FALLBACK } from "../config/imageAssets.defaults";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/** Deep-merge partial API payload with defaults. */
export function normalizeImageAssets(raw) {
  const base = JSON.parse(JSON.stringify(DEFAULT_IMAGE_ASSETS));
  if (!raw || typeof raw !== "object") return base;

  if (raw.home && typeof raw.home === "object") {
    Object.keys(base.home).forEach((k) => {
      if (isNonEmptyString(raw.home[k])) base.home[k] = raw.home[k].trim();
    });
  }
  if (raw.categories && typeof raw.categories === "object") {
    Object.keys(base.categories).forEach((k) => {
      if (isNonEmptyString(raw.categories[k])) base.categories[k] = raw.categories[k].trim();
    });
  }
  return base;
}

/** Map category slug (API) → imageAssets.categories key */
export function categorySlugToAssetKey(slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  const map = {
    "mens-shirts": "men",
    "women-kurtas": "women",
    "kids-wear": "kids",
    accessories: "accessories",
    men: "men",
    women: "women",
    kids: "kids",
  };
  return map[s] || null;
}

export function resolveCategoryBannerUrl(imageAssets, segmentOrSlug) {
  if (!imageAssets?.categories || !segmentOrSlug) return "";
  const key =
    segmentOrSlug === "men" ||
    segmentOrSlug === "women" ||
    segmentOrSlug === "kids" ||
    segmentOrSlug === "accessories"
      ? segmentOrSlug
      : categorySlugToAssetKey(segmentOrSlug);
  if (!key) return "";
  return imageAssets.categories[key] || "";
}

export { PICSUM_FALLBACK };
