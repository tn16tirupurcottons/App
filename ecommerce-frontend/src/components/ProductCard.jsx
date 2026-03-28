import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "./Toast";
import { getProductImage, handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

export default function ProductCard({ product }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const categoryName = product?.Category?.name || product?.category?.name || "";
  const image = getProductImage(product, categoryName);
  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);

  useEffect(() => {
    const validImage = image || FALLBACK_IMAGES.product;
    setCurrentImage(validImage);
    setImageError(false);
  }, [image, product?.id]);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/login");
        throw new Error("Please log in to save wishlist");
      }
      return axiosClient.post("/wishlist", { productId: product.id });
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Saved to wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (err) => {
      const message =
        err.message === "Please log in to save wishlist"
          ? err.message
          : err.response?.data?.message || err.message || "Unable to save to wishlist";
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
      className="group flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5 w-full"
    >
      <div className="relative bg-neutral-100 overflow-hidden w-full aspect-[3/4]">
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-neutral-600 hover:text-neutral-900 rounded-full p-2 border border-neutral-200 shadow-sm transition duration-200 ease-in-out"
        >
          <FaHeart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wishlistMutation.isSuccess ? "text-sky-400 fill-sky-400" : ""}`}
            aria-hidden="true"
          />
        </button>
        <img
          src={currentImage || image || FALLBACK_IMAGES.product}
          alt={product.name || "Product"}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
          onError={(e) => {
            if (!imageError) {
              setImageError(true);
              const fallback = FALLBACK_IMAGES.product;
              setCurrentImage(fallback);
              e.target.src = fallback;
              e.target.onerror = null;
            }
          }}
          onLoad={() => setImageError(false)}
        />
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase bg-neutral-900 text-white px-2 py-1 font-bold">
            {Math.round((product.discount / product.price) * 100)}% off
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 line-clamp-1">
          {product.Category?.name || product.brand || "Studio"}
        </p>
        <h3 className="text-sm sm:text-base font-semibold text-neutral-900 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-neutral-700 transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-neutral-900 tabular-nums">₹{finalPrice.toFixed(0)}</span>
          {product.discount > 0 && (
            <span className="text-xs text-neutral-400 line-through tabular-nums">
              ₹{Number(product.price).toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
