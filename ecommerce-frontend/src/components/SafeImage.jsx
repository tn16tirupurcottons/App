import React, { useState } from "react";

const picsum = (seed) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(seed || "x"))}/600/800`;

/**
 * Never shows a broken image: falls back to Lorem Picsum on error.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  seed = "img",
  onError: onErrorProp,
  ...rest
}) {
  const [useFallback, setUseFallback] = useState(false);
  const displaySrc = useFallback || !src ? picsum(seed) : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        onErrorProp?.(e);
        if (!useFallback) setUseFallback(true);
      }}
      {...rest}
    />
  );
}
