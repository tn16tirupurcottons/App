import React, { useContext, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "./Toast";
import { getProductImage } from "../utils/imageUtils";
import { useAppImages } from "../context/AppImagesContext";
import { isUuid } from "../utils/validation";
import { ensureProductGallery } from "../utils/productImageUtils";

export default function ProductCard({ product }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { getImage } = useAppImages();
  const globalFallback = getImage("GLOBAL_FALLBACK_IMAGE");
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const categoryName = product?.Category?.name || product?.category?.name || "";
  
  // Get primary image from gallery - FIX FOR SHARED REFERENCE BUG
  // Always get a fresh copy to prevent shared references between products
  const productGallery = useMemo(() => {
    if (!product) return [];
    
    // Ensure gallery is a fresh copy, not shared with other products
    const gallery = Array.isArray(product.gallery) ? product.gallery : [];
    const validated = gallery.filter(img => img && typeof img === 'string');
    
    // If no gallery, use fallback
    if (validated.length === 0) {
      return ensureProductGallery(product);
    }
    
    return validated;
  }, [product?.id, product?.gallery]); // NOTE: productId in dependency array ensures fresh copy
  
  const image = productGallery[0] || getProductImage(product, categoryName);
  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);
  const discountPct =
    product.price > 0 && product.discount > 0
      ? Math.round((Number(product.discount) / Number(product.price)) * 100)
      : 0;

  const currentImage = useMemo(() => {
    const validImage = image || globalFallback;
    return validImage;
  }, [image, globalFallback]);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [image, product?.id, globalFallback]); // product?.id ensures fresh render per product

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/login");
        throw new Error("Please log in to save wishlist");
      }
      if (!isUuid(product?.id)) {
        throw new Error("This preview item can't be saved to your wishlist.");
      }
      return axiosClient.post("/wishlist", { productId: String(product.id).trim() });
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
      className="product-card group bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-200 ease-in-out hover:border-neutral-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 w-full fade-in-up"
    >
      <div className="relative bg-neutral-100 overflow-hidden w-full">
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-neutral-600 hover:text-neutral-900 rounded-full p-2 border border-neutral-200 shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
        >
          <FaHeart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wishlistMutation.isSuccess ? "text-sky-400 fill-sky-400" : ""}`}
            aria-hidden="true"
          />
        </button>
        <div className="relative w-full h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          <img
            src={currentImage || image || globalFallback}
            alt={product.name || 'Product'}
            className="product-card-image transition-all duration-200 ease-in-out group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
            sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, (max-width:1280px) 20vw, 16vw"
            onError={(e) => {
              if (!imageError) {
                setImageError(true);
                e.target.src = globalFallback;
                e.target.onerror = null;
              }
            }}
            onLoad={() => {
              setImageError(false);
              setImageLoaded(true);
            }}
          />
        </div>
        {product.isLightningDeal && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase bg-red-600 text-white px-2 py-1 font-bold">
            Lightning Deal
          </span>
        )}

        {product.isOnOffer && !product.isLightningDeal && (
          <span className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase bg-amber-500 text-black px-2 py-1 font-bold">
            {product.offerTag ? product.offerTag.replace(/-/g, " ") : "Offer"}
          </span>
        )}

        {discountPct >= 1 && (
          <span className="absolute top-3 right-3 text-[9px] tracking-[0.2em] uppercase bg-neutral-900 text-white px-2 py-1 font-bold">
            {discountPct}% off
          </span>
        )}
      </div>
      <div className="p-2 md:p-2.5 flex-1 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 line-clamp-1">
          {product.Category?.name || product.brand || "Studio"}
        </p>
        <h3 className="product-title font-semibold text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-700 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="price font-bold text-neutral-900 tabular-nums">₹{finalPrice.toFixed(0)}</span>
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
