import React, { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      <div className="aspect-square bg-neutral-200/70 animate-pulse" />
      <div className="p-2 md:p-2.5">
        <div className="h-3 w-16 bg-neutral-200/70 rounded animate-pulse" />
        <div className="mt-2 h-3 w-full bg-neutral-200/70 rounded animate-pulse" />
        <div className="mt-2 h-3 w-3/5 bg-neutral-200/70 rounded animate-pulse" />
        <div className="mt-3 h-4 w-24 bg-neutral-200/70 rounded animate-pulse" />
      </div>
    </div>
  );
});

const ProductGrid = memo(function ProductGrid({
  title = "Featured products",
  products = [],
  loading = false,
  viewAllTo = "/catalog",
}) {
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (reduceMotion) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <section className="my-4 md:my-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div
          className={[
            "bg-white rounded-xl border border-neutral-200 shadow-sm",
            "p-3 md:p-4",
            "transition-all duration-200 ease-in-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-600">
                {loading ? "Loading" : products?.length ? `${products.length} items` : "0 items"}
              </div>
              <Link
                to={viewAllTo}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-200 ease-in-out"
              >
                View all
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {new Array(10).fill(null).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products?.length ? (
            <>
              <div className="md:hidden mt-3 -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="inline-flex gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="shrink-0 w-[180px] snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:grid mt-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              No products found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default ProductGrid;
