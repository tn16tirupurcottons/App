/**
 * Default URLs for app image keys (used when API row missing or empty).
 * Single source for storefront fallbacks — aligns with backend seed URLs.
 */
import { categoryStock, heroBackdrop, segmentVisuals, stockPhoto } from "../data/visualAssets";

export const APP_IMAGE_DEFAULTS = {
  GLOBAL_FALLBACK_IMAGE: stockPhoto("photo-1558769132-cb1aea458c5e", 1200),
  HOME_HERO_BACKDROP: heroBackdrop,
  HOME_PROMO_HERO: heroBackdrop,
  HOME_PROMO_1: stockPhoto("photo-1594633313593-af9fa9836b99", 1600),
  HOME_PROMO_2: stockPhoto("photo-1519457438214-596aece209bb", 1600),
  HOME_EDITORIAL_MEN_LAYERS: segmentVisuals.men.tiles[0],
  HOME_EDITORIAL_WOMEN_SILHOUETTES: segmentVisuals.women.tiles[1],
  HOME_EDITORIAL_STUDIO_DROP: segmentVisuals.genz.tiles[0],
  HOME_COLLECTION_LIGHT_LAYERS: stockPhoto("photo-1572804013309-6e6b7da0e1b5", 1400),
  HOME_COLLECTION_CORE_TEES: stockPhoto("photo-1620799140408-ed534d5b51d4", 1400),
  HOME_OFFER_LIMITED: categoryStock.men,
  HOME_OFFER_NEW_IN: categoryStock.women,
  HOME_OFFER_TOP_MOVES: categoryStock.dressFashion,
  HOME_LOOK_SOFT_TAILORING: segmentVisuals.women.tiles[2],
  HOME_LOOK_DENIM_SHIRTS: segmentVisuals.men.tiles[1],
  HOME_LOOK_KIDS: segmentVisuals.kids.tiles[0],
  HOME_LOOK_STUDIO: segmentVisuals.genz.tiles[2],
  HOME_HERO_TIRUPUR_BANNER: heroBackdrop,
  CAT_GRID_MENS_SHIRTS: categoryStock.men,
  CAT_GRID_WOMEN_KURTAS: categoryStock.women,
  CAT_GRID_KIDS_WEAR: categoryStock.kids,
  CAT_GRID_ATHLEISURE: categoryStock.athleisure,
  CAT_GRID_ACCESSORIES: categoryStock.accessories,
  CAT_GRID_TN18_LEGACY: categoryStock.accessories,
  HERO_BANNER_MEN: segmentVisuals.men.tiles[0],
  HERO_BANNER_WOMEN: segmentVisuals.women.tiles[0],
  HERO_BANNER_KIDS: segmentVisuals.kids.tiles[0],
};

["men", "women", "kids", "genz", "accessories"].forEach((seg) => {
  const v = segmentVisuals[seg];
  const U = seg.toUpperCase();
  APP_IMAGE_DEFAULTS[`SEGMENT_${U}_BANNER`] = v.banner;
  v.tiles.forEach((url, i) => {
    APP_IMAGE_DEFAULTS[`SEGMENT_${U}_TILE_${i}`] = url;
  });
});

export function withCacheBust(url, bust) {
  if (!url || bust == null) return url;
  const sep = String(url).includes("?") ? "&" : "?";
  return `${url}${sep}cb=${bust}`;
}
