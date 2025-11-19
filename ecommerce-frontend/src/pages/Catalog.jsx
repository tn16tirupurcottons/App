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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-14 space-y-8 text-dark">
      {segmentTheme && (
        <div
          className="rounded-[40px] p-8 md:p-12 text-white border border-border shadow-medium"
          style={{
            background: `linear-gradient(135deg, ${segmentTheme.primary} 0%, ${segmentTheme.accent} 100%)`,
          }}
        >
          <p className="pill text-white/90 mb-3">
            {segmentTheme.label} Collection
          </p>
          <h1 className="text-3xl md:text-4xl font-display mb-4">
            {segmentTheme.description}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Discover curated {segmentTheme.label.toLowerCase()} styles from TN16
            Tirupur Cotton.
          </p>
        </div>
      )}

      <div>
        <p className="pill text-muted">
          {segmentTheme ? `${segmentTheme.label} Edit` : "TN16 Cotton Edit"}
        </p>
        <h1 className="text-2xl md:text-3xl font-display mt-1 text-dark">
          {segmentTheme
            ? `Browse ${segmentTheme.label} collection`
            : "Browse the complete TN16 Tirupur Cotton catalog"}
        </h1>
        <p className="text-muted mt-3 max-w-2xl">
          Filter by category, sort by price and discover curated cotton looks
          from Tirupur's ateliers.
        </p>
      </div>

      <ProductList initialQuery={initialQuery} />
    </div>
  );
}

