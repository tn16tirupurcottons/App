/**
 * Canonical keys for themeTokens.imageAssets (stored in BrandSetting.themeTokens JSONB).
 * URLs only — uploads resolve to URLs via /api/upload before save.
 */
export const DEFAULT_IMAGE_ASSETS = {
  home: {
    hero: "",
    promo1: "",
    promo2: "",
  },
  categories: {
    men: "",
    women: "",
    kids: "",
    accessories: "",
  },
};

export const PICSUM_FALLBACK = "https://picsum.photos/400/500";
