import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getCategoryImage, handleImageError } from "../utils/imageUtils";

export default function CategoryGrid({ categories = [], loading = false }) {
  const fallback = [
    {
      id: "mens-shirts",
      name: "Men's Shirts",
      heroImage:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      slug: "mens-shirts",
    },
    {
      id: "women-kurtas",
      name: "Women Kurtas",
      heroImage:
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80",
      slug: "women-kurtas",
    },
    {
      id: "kids-wear",
      name: "Kids Wear",
      heroImage:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
      slug: "kids-wear",
    },
    {
      id: "athleisure",
      name: "Athleisure",
      heroImage:
        "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=800&q=80",
      slug: "athleisure",
    },
  ];

  const list = categories.length ? categories : fallback;

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="pill text-muted">Catalogue</p>
          <h2 className="text-3xl font-display text-dark tracking-wide mt-1">
            Signature categories
          </h2>
        </div>
        <Link
          to="/catalog"
          className="text-xs uppercase tracking-[0.3em] text-muted hover:text-primary"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {(loading ? new Array(4).fill(null) : list).map((cat, idx) => (
          <Link
            to={`/catalog?category=${cat?.slug || cat?.id}`}
            key={cat?.id || idx}
            className="relative rounded-3xl overflow-hidden border border-border shadow-soft group hover:shadow-medium transition-shadow"
          >
            {loading ? (
              <div className="w-full h-48 bg-light animate-pulse" />
            ) : (
              <>
                <img
                  src={getCategoryImage(cat)}
                  alt={cat?.name || "Category"}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <p className="text-lg font-semibold">{cat?.name}</p>
                  {cat?.description && (
                    <p className="text-xs text-white/90 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
