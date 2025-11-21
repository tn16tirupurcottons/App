import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import ProductCard from "./ProductCard";

const defaultQuery = {
  search: "",
  categorySlug: "",
  sort: "newest",
  page: 1,
  limit: 12,
};

export default function ProductList({ initialQuery = {} }) {
  const [query, setQuery] = useState({ ...defaultQuery, ...initialQuery });

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      ...initialQuery,
      page: 1,
    }));
  }, [initialQuery]);

  const { data: categoriesData } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data;
    },
  });

  const categories = useMemo(
    () => categoriesData?.items || [],
    [categoriesData]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["catalog-products", query],
    queryFn: async () => {
      const params = new URLSearchParams(query).toString();
      const res = await axiosClient.get(`/products?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = data?.items || [];

  const handleChange = (field, value) => {
    setQuery((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? value : 1,
    }));
  };

  return (
    <div className="space-y-8 text-dark">
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search silhouettes, fabrics, artisans"
          value={query.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="flex-1 min-w-[180px] rounded-full border border-border bg-light px-5 py-2 text-sm text-dark placeholder:text-muted focus:outline-none focus:border-primary"
        />
        <select
          value={query.categorySlug}
          onChange={(e) => handleChange("categorySlug", e.target.value)}
          className="rounded-full border border-border bg-light px-4 py-2 text-sm text-dark focus:outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={query.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="rounded-full border border-border bg-light px-4 py-2 text-sm text-dark focus:outline-none focus:border-primary"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Desktop: 6-8 products per row, Mobile: 4 visible with swipe */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 lg:gap-6">
        {isLoading
          ? new Array(8).fill(null).map((_, idx) => (
              <div key={idx} className="h-80 rounded-[32px] bg-light animate-pulse" />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Mobile: 10 products per row, 5 visible at a time, scrollable */}
      <div className="md:hidden overflow-hidden -mx-4 px-4">
        <div 
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ 
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {isLoading
            ? new Array(10).fill(null).map((_, idx) => (
                <div key={idx} className="flex-shrink-0 w-[calc(20%-0.6rem)] snap-start">
                  <div className="h-64 rounded-2xl bg-light animate-pulse" />
                </div>
              ))
            : products.slice(0, 10).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[calc(20%-0.6rem)] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
        {products.length > 10 && (
          <p className="text-xs text-center text-muted mt-2">
            Swipe to see more products →
          </p>
        )}
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 text-dark/70">
          <button
            disabled={query.page <= 1}
            onClick={() => handleChange("page", query.page - 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30 hover:border-primary hover:text-primary"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {data.page || 1} of {data.totalPages || 1}
          </span>
          <button
            disabled={(data.page || 1) >= (data.totalPages || 1)}
            onClick={() => handleChange("page", query.page + 1)}
            className="px-4 py-2 rounded-full border border-border disabled:opacity-30 hover:border-primary hover:text-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
