import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import ProductCard from "./ProductCard";

export default function AiStylistSection({ userId }) {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["aiStylist", userId],
    queryFn: async () => {
      const response = await axiosClient.get(`/products/ai/stylist/${userId}?occasion=casual`);
      return response.data;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 10,
  });

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <div className="text-sm text-neutral-500">Loading style recommendations...</div>;
  }

  if (isError || !data?.success) {
    return <div className="text-sm text-red-500">Unable to fetch your stylist recommendations.</div>;
  }

  const { recommended = [], outfitCombos = [], trending = [] } = data;

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 p-4 bg-white">
      <h2 className="text-xl font-semibold tracking-tight">Styled for You</h2>
      <p className="text-sm text-neutral-500">AI-crafted outfit combos from your buying style and trend data.</p>

      {outfitCombos.length > 0 && (
        <div className="space-y-3">
          {outfitCombos.map((combo, idx) => (
            <div key={idx} className="rounded-lg border p-3">
              <h3 className="text-sm font-bold">{combo.title}</h3>
              <p className="text-xs text-neutral-500 mb-2">{combo.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {combo.items.map((product) => (
                  <ProductCard key={product.id} product={product} mini />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Recommended for you</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} mini />
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Trend picks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} mini />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
