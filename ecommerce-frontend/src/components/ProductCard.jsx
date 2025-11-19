import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "./Toast";

export default function ProductCard({ product }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const image =
    product?.thumbnail ||
    product?.gallery?.[0] ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";
  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/login");
        throw new Error("Please log in to save wishlist");
      }
      return axiosClient.post("/wishlist", { productId: product.id });
    },
    onSuccess: (response) => {
      const message = response?.data?.message || "Saved to wishlist";
      toast.success(message);
    },
    onError: (err) => {
      const message =
        err.message === "Please log in to save wishlist"
          ? err.message
          : err.response?.data?.message || "Unable to save to wishlist";
      toast.error(message);
    },
  });

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (wishlistMutation.isPending) return;
    wishlistMutation.mutate();
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group card overflow-hidden flex flex-col hover:shadow-medium transition-shadow"
    >
      <div className="relative">
        <button
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          className="absolute top-4 right-4 z-10 bg-white/90 text-muted hover:text-primary rounded-full p-2 border border-border shadow-soft"
        >
          <FaHeart
            className={`h-4 w-4 ${
              wishlistMutation.isSuccess ? "text-primary fill-primary" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        <img
          src={image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.4em] uppercase bg-primary text-white px-2 py-1 rounded-full font-semibold">
            {Math.round((product.discount / product.price) * 100)}% off
          </span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col text-dark">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">
          {product.Category?.name || product.brand || "TN16"}
        </p>
        <h3 className="text-base font-semibold mt-2 line-clamp-2 min-h-[44px]">
          {product.name}
        </h3>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-primary">₹{finalPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-muted line-through">
              ₹{Number(product.price).toFixed(0)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted mt-auto tracking-[0.3em] uppercase">
          Ships in 72 hrs · Tirupur
        </p>
      </div>
    </Link>
  );
}
