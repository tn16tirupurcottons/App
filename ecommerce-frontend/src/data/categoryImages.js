/**
 * Category image pools for CMS/admin or future catalog features.
 */
import { categoryStock, segmentVisuals, stockPhoto } from "./visualAssets";

const pool = (arr) => arr.map((u) => u);

const luxuryImageBase = {
  men: pool([
    ...segmentVisuals.men.tiles,
    segmentVisuals.men.banner,
    stockPhoto("photo-1603252109303-6221150e45d7", 800),
  ]),
  women: pool([
    ...segmentVisuals.women.tiles,
    segmentVisuals.women.banner,
    stockPhoto("photo-1469334031218-e382a71b716b", 800),
  ]),
  kids: pool([
    ...segmentVisuals.kids.tiles,
    segmentVisuals.kids.banner,
  ]),
  accessories: pool([
    categoryStock.accessories,
    stockPhoto("photo-1590874103328-ac9a0bb7dbaf", 800),
    stockPhoto("photo-1523381210434-271e8be1f52b", 800),
  ]),
};

export function getCategoryImages(categorySlug, count = null) {
  const normalizedSlug = categorySlug?.toLowerCase() || "";
  const images = luxuryImageBase[normalizedSlug] || luxuryImageBase.men;
  if (count && count > 0) {
    return images.slice(0, count);
  }
  return images;
}

export function getAllCategoryImages() {
  const result = {};
  Object.keys(luxuryImageBase).forEach((category) => {
    result[category] = getCategoryImages(category);
  });
  return result;
}

export default luxuryImageBase;
