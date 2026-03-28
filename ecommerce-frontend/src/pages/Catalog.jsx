import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductList from "../components/ProductList";
import { segmentThemes } from "../data/segments";

const segmentToCategorySlug = {
  men: "mens-shirts",
  women: "women-kurtas",
  kids: "kids-wear",
  genz: "genz",
};

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const segment = searchParams.get("segment");
  const categorySlugFromSegment = segment ? segmentToCategorySlug[segment] : null;

  const initialQuery = useMemo(
    () => ({
      search: searchParams.get("query") || "",
      categorySlug: searchParams.get("category") || categorySlugFromSegment || "",
    }),
    [searchParams, categorySlugFromSegment]
  );

  const segmentTheme = segment ? segmentThemes[segment] : null;

  const brand = import.meta.env.VITE_BRAND_NAME || "Studio";

  const primaryBannerSrc = segmentTheme
    ? segmentTheme.backgroundImage || segmentTheme.banner
    : "";
  const alternateBannerSrc =
    segmentTheme && segmentTheme.banner !== primaryBannerSrc ? segmentTheme.banner : "";
  const tileFallbackSrc = segmentTheme?.tiles?.[0] || "";

  const [bannerSrc, setBannerSrc] = useState(primaryBannerSrc);

  useEffect(() => {
    if (segmentTheme) {
      setBannerSrc(segmentTheme.backgroundImage || segmentTheme.banner);
    }
  }, [segment, segmentTheme?.backgroundImage, segmentTheme?.banner]);

  return (
    <div className="w-full space-y-12 sm:space-y-16 text-neutral-900">
      {segmentTheme && (
        <section
          className="relative isolate overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-sm min-h-[220px] sm:min-h-[280px] md:min-h-[320px]"
          aria-label={`${segmentTheme.label} collection banner`}
        >
          <img
            src={bannerSrc}
            alt=""
            width={1600}
            height={900}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center pointer-events-none select-none"
            onError={() => {
              if (alternateBannerSrc && bannerSrc !== alternateBannerSrc) {
                setBannerSrc(alternateBannerSrc);
              } else if (tileFallbackSrc && bannerSrc !== tileFallbackSrc) {
                setBannerSrc(tileFallbackSrc);
              }
            }}
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-r from-white/95 via-white/78 to-white/40 pointer-events-none"
            aria-hidden
          />
          <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-[#555555] mb-3 sm:mb-4">
              {segmentTheme.label} collection
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-[0.04em] text-[#000000] leading-[1.02] drop-shadow-sm">
              {segmentTheme.description}
            </h1>
            <p className="text-[#555555] text-sm sm:text-base mt-4 sm:mt-6 max-w-xl leading-relaxed">
              Curated {segmentTheme.label.toLowerCase()} — premium cotton, clean silhouettes, {brand}.
            </p>
          </div>
        </section>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
          {segmentTheme ? `${segmentTheme.label}` : "Catalog"}
        </p>
        <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-[0.04em] text-neutral-900 mt-2">
          {searchParams.get("query")
            ? `Results · “${searchParams.get("query")}”`
            : segmentTheme
              ? `Shop ${segmentTheme.label}`
              : "All products"}
        </h2>
        <p className="text-neutral-600 mt-4 text-sm max-w-2xl leading-relaxed">
          {searchParams.get("query")
            ? "Find your piece in the grid below."
            : "Filter, sort, and scroll — minimal chrome, maximum product."}
        </p>
      </div>

      <ProductList initialQuery={initialQuery} />
    </div>
  );
}
