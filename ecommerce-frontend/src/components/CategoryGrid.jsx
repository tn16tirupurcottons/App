import React from "react";
import { Link } from "react-router-dom";

export default function CategoryGrid({ categories = [], loading = false }) {
  const fallback = [
    {
      id: "mens-shirts",
      name: "Men's Shirts",
      heroImage:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    slug: "mens-shirts",
  },
    {
      id: "women-kurtas",
      name: "Women Kurtas",
      heroImage:
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=600&q=80",
    slug: "women-kurtas",
  },
    {
      id: "kids-wear",
      name: "Kids Wear",
      heroImage:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80",
    slug: "kids-wear",
  },
    {
      id: "athleisure",
      name: "Athleisure",
      heroImage:
        "https://images.unsplash.com/photo-1484519332611-516457305ff6?auto=format&fit=crop&w=600&q=80",
    slug: "athleisure",
  },
  ];

  const list = categories.length ? categories : fallback;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-pink-500 font-semibold">
            Shop the clothing grid
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        </div>
        <Link
          to="/catalog"
          className="text-sm font-semibold text-pink-600 hover:text-pink-700"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(loading ? new Array(4).fill(null) : list).map((cat, idx) => (
          <Link
            to={`/catalog?category=${cat?.slug || cat?.id}`}
            key={cat?.id || idx}
            className="relative rounded-2xl overflow-hidden shadow-lg group border border-white/70"
          >
            {loading ? (
              <div className="w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />
            ) : (
              <>
                <img
                  src={cat?.heroImage}
                  alt={cat?.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-lg font-semibold">{cat?.name}</p>
                  {cat?.description && (
                    <p className="text-xs text-white/80 truncate">
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
