import React, { useState } from "react";
import { PICSUM_FALLBACK } from "../config/imageAssets.defaults";

/**
 * Never shows a broken image: falls back to Lorem Picsum on error.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  seed = "img",
  ...rest
}) {
  const [useFallback, setUseFallback] = useState(false);
  const displaySrc =
    useFallback || !src
      ? `${PICSUM_FALLBACK.split("?")[0]}?random=${encodeURIComponent(String(seed))}`
      : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!useFallback) setUseFallback(true);
      }}
      {...rest}
    />
  );
}
