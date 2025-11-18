import React, { useMemo } from "react";
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 space-y-6">
      {segmentTheme && (
        <div
          className="rounded-3xl p-8 md:p-12 text-white mb-8"
          style={{ background: `linear-gradient(135deg, ${segmentTheme.primary} 0%, ${segmentTheme.accent} 100%)` }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/80 font-semibold mb-2">
            {segmentTheme.label} Collection
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {segmentTheme.description}
          </h1>
          <p className="text-white/90 text-lg">
            Discover curated {segmentTheme.label.toLowerCase()} styles from TN16 Tirupur Cotton.
          </p>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-pink-500 font-semibold">
          {segmentTheme ? `${segmentTheme.label} Edit` : "TN16 Cotton Edit"}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {segmentTheme 
            ? `Browse ${segmentTheme.label} Collection` 
            : "Browse the complete TN16 Tirupur Cotton catalog"}
        </h1>
        <p className="text-gray-600 mt-2">
          Filter by category, sort by price and discover curated cotton looks
          from Tirupur's ateliers.
        </p>
      </div>

      <ProductList initialQuery={initialQuery} />
    </div>
  );
}

