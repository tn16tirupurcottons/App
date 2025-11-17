import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const image =
    product?.thumbnail ||
    product?.gallery?.[0] ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";
  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition flex flex-col"
    >
      <div className="relative">
        <img
          src={image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-white/90 text-xs font-semibold text-pink-600 px-2 py-1 rounded-full">
            {Math.round((product.discount / product.price) * 100)}% off
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-1">
          {product.Category?.name || product.brand || "TN16"}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{finalPrice.toFixed(0)}
          </span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ₹{Number(product.price).toFixed(0)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-auto">
          Ships in 72 hrs · Tirupur, TN
        </p>
      </div>
    </Link>
  );
}
