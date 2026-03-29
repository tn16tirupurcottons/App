import { useMemo } from "react";
import { useAppImages } from "../context/AppImagesContext";

/**
 * Resolves the three homepage segment collage tiles from app image keys.
 * @param {string} segmentKey — e.g. "men", "women", "kids", "genz", "accessories"
 */
export function useSegmentTiles(segmentKey) {
  const { getImage } = useAppImages();
  return useMemo(() => {
    const u = String(segmentKey || "").toUpperCase();
    if (!u) return ["", "", ""];
    return [0, 1, 2].map((i) => getImage(`SEGMENT_${u}_TILE_${i}`));
  }, [segmentKey, getImage]);
}
