import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";
import FilterSidebar from "./FilterSidebar";
import { normalizeCategorySlug } from "../utils/validation";

const defaultQuery = {
  search: "",
  categorySlug: "",
  subCategorySlug: "",
  size: [],
  color: [],
  brand: [],
  sort: "newest",
  page: 1,
  limit: 12,
};

function buildProductQueryString(q) {
  const params = new URLSearchParams();

  const payload = {
    ...q,
    category: q.categorySlug,
    subCategory: q.subCategorySlug,
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;
    if (key === "category" && normalizeCategorySlug(value) === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === "" || item === null || item === undefined) return;
        params.append(key, String(item));
      });
      return;
    }
    params.set(key, String(value));
  });

  return params.toString();
}

export default function ProductList({ initialQuery = {} }) {
  const mergedInitial = useMemo(() => {
    const cat = normalizeCategorySlug(initialQuery.categorySlug);
    return {
      ...defaultQuery,
      ...initialQuery,
      categorySlug: cat,
      subCategorySlug: initialQuery.subCategorySlug || "",
      size: Array.isArray(initialQuery.size) ? initialQuery.size : [],
      color: Array.isArray(initialQuery.color) ? initialQuery.color : [],
      brand: Array.isArray(initialQuery.brand) ? initialQuery.brand : [],
      search: initialQuery.search ?? "",
    };
  }, [initialQuery]);

  const [query, setQuery] = useState(mergedInitial);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery((prev) => ({
      ...prev,
      ...mergedInitial,
    }));
  }, [mergedInitial]);

  const { data: categoriesData } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      return res.data;
    },
  });

  const categories = useMemo(() => categoriesData?.items || [], [categoriesData]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "catalog-products",
      query.search,
      query.categorySlug,
      query.subCategorySlug,
      JSON.stringify(query.size),
      JSON.stringify(query.color),
      JSON.stringify(query.brand),
      query.sort,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const qs = buildProductQueryString({ ...query, page: pageParam });
      const res = await axiosClient.get(`/products?${qs}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    keepPreviousData: true,
  });

  const products = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || [];
  }, [data]);

  const loadMoreRef = useRef(null);

  const handleIntersect = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "100px",
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [handleIntersect]);

  const handleChange = (field, value) => {
    setQuery((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputClass =
    "rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-200 transition duration-200 ease-in-out";

  return (
    <div className="space-y-6 text-neutral-900">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          placeholder="Search products…"
          value={query.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className={`flex-1 min-w-0 sm:min-w-[200px] ${inputClass}`}
        />
        <select
          value={query.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className={`sm:w-48 ${inputClass}`}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <div className="top-filter-bar rounded-2xl border border-neutral-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:border-neutral-300"
        >
          Filters
        </button>
        <span className="text-sm text-neutral-600">
          {isLoading ? "Loading products…" : `${products.length} items`}
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="catalog-layout">
        {/* Sidebar */}
        <FilterSidebar
          query={query}
          onChange={handleChange}
          categories={categories}
          isMobileOpen={isMobileFiltersOpen}
          onMobileToggle={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        />

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="product-grid-layout">
            {isLoading
              ? new Array(12).fill(null).map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!isLoading && products.length === 0 && (
            <p className="text-center text-neutral-500 py-16 text-sm uppercase tracking-widest">Nothing here yet.</p>
          )}

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                  Loading more products...
                </div>
              ) : (
                <div className="h-4"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
