import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductList from "../components/ProductList";

export default function Catalog() {
  const [searchParams] = useSearchParams();

  const initialQuery = useMemo(
    () => ({
      search: searchParams.get("query") || "",
      categorySlug: searchParams.get("category") || "",
    }),
    [searchParams]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-pink-500 font-semibold">
          TN16 Decor Edit
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Browse the entire LimeRoad-inspired catalog
        </h1>
        <p className="text-gray-600 mt-2">
          Filter by category, sort by price and discover curated cotton decor
          stories.
        </p>
      </div>

      <ProductList initialQuery={initialQuery} />
    </div>
  );
}

