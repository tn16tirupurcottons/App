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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search decor..."
          value={query.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="flex-1 min-w-[180px] rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <select
          value={query.categorySlug}
          onChange={(e) => handleChange("categorySlug", e.target.value)}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={query.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading
          ? new Array(8).fill(null).map((_, idx) => (
              <div
                key={idx}
                className="h-80 bg-white rounded-2xl animate-pulse"
              />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={query.page <= 1}
            onClick={() => handleChange("page", query.page - 1)}
            className="px-4 py-2 rounded-full border text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {data.page || 1} of {data.totalPages || 1}
          </span>
          <button
            disabled={(data.page || 1) >= (data.totalPages || 1)}
            onClick={() => handleChange("page", query.page + 1)}
            className="px-4 py-2 rounded-full border text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
