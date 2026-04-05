import React, { useState } from "react";
import { useAppImages } from "../context/AppImagesContext";

/**
 * Image with graceful fallback — uses managed GLOBAL_FALLBACK_IMAGE when src fails.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  onError: onErrorProp,
  ...rest
}) {
  const { getImage } = useAppImages();
  const [useFallback, setUseFallback] = useState(false);
  const fb = getImage("GLOBAL_FALLBACK_IMAGE");
  const displaySrc = useFallback || !src ? fb : src;

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
