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

  const categories = useMemo(() => categoriesData?.items || [], [categoriesData]);

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

  const inputClass =
    "rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-200 transition duration-200 ease-in-out";

  return (
    <div className="space-y-10 text-neutral-900">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          placeholder="Search products…"
          value={query.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className={`flex-1 min-w-0 sm:min-w-[200px] ${inputClass}`}
        />
        <select
          value={query.categorySlug}
          onChange={(e) => handleChange("categorySlug", e.target.value)}
          className={`sm:w-48 ${inputClass}`}
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
          className={`sm:w-48 ${inputClass}`}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
        {isLoading
          ? new Array(8).fill(null).map((_, idx) => (
              <div key={idx} className="aspect-[3/4] rounded-xl bg-neutral-100 animate-pulse" />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="text-center text-neutral-500 py-16 text-sm uppercase tracking-widest">Nothing here yet.</p>
      )}

      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 text-zinc-400 pt-8">
          <button
            type="button"
            disabled={query.page <= 1}
            onClick={() => handleChange("page", query.page - 1)}
            className="px-5 py-2 rounded-none border border-white/15 text-xs font-bold uppercase tracking-widest disabled:opacity-25 hover:border-sky-400 hover:text-sky-400 transition duration-200 ease-in-out"
          >
            Prev
          </button>
          <span className="text-xs tabular-nums">
            {data.page || 1} / {data.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={(data.page || 1) >= (data.totalPages || 1)}
            onClick={() => handleChange("page", query.page + 1)}
            className="px-5 py-2 rounded-lg border border-neutral-200 text-xs font-bold uppercase tracking-widest disabled:opacity-25 hover:border-neutral-900 hover:text-neutral-900 transition duration-200 ease-in-out"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
