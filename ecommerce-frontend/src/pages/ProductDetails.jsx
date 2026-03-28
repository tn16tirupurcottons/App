import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getProductImage, handleImageError, FALLBACK_IMAGES, isValidImageUrl } from "../utils/imageUtils";
import { isUuid } from "../utils/validation";
import FullScreenImageViewer from "../components/FullScreenImageViewer";

const FALLBACK_IMAGE = FALLBACK_IMAGES.product;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/products/${id}`);
      return res.data;
    },
    retry: 2,
  });

  const gallery = useMemo(() => {
    if (!product) return [FALLBACK_IMAGE];
    const images = [];
    const categoryName = product?.Category?.name || product?.category?.name || "";
    const primaryImage = getProductImage(product, categoryName);
    if (primaryImage && !images.includes(primaryImage)) images.push(primaryImage);
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    if (product.thumbnail && !images.includes(product.thumbnail) && isValidImageUrl(product.thumbnail)) {
      images.unshift(product.thumbnail);
    }
    return images.length > 0 ? images : [FALLBACK_IMAGE];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setActiveImage(0);
    setIsFullScreenOpen(false);
  }, [id]);

  useEffect(() => {
    if (product?.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product?.colors?.length) setSelectedColor(product.colors[0]);
  }, [product]);

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/login");
        throw new Error("AUTH_REQUIRED");
      }
      return axiosClient.post("/cart", {
        productId: product.id,
        quantity,
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        unitPrice: Number(product.price || 0) - Number(product.discount || 0),
      });
    },
    onSuccess: () => {
      setFeedback("Added to bag.");
      setTimeout(() => setFeedback(""), 3000);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      if (err.response?.status === 401 || err.message === "AUTH_REQUIRED") {
        navigate("/login");
      } else {
        setFeedback(err.response?.data?.message || "Unable to add to bag.");
        setTimeout(() => setFeedback(""), 5000);
      }
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/login");
        throw new Error("Please log in to save wishlist");
      }
      if (!product?.id || !isUuid(product.id)) {
        throw new Error("Invalid product — can't update wishlist.");
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-0 py-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="aspect-[3/4] bg-neutral-100 rounded-xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-12 bg-neutral-100 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-neutral-100 rounded animate-pulse w-1/3" />
            <div className="h-24 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center px-4">
        <h2 className="text-3xl font-display uppercase tracking-[0.06em] text-neutral-900 mb-4">Not found</h2>
        <p className="text-neutral-600 text-sm mb-8">This product is unavailable.</p>
        <Link
          to="/catalog"
          className="inline-block bg-neutral-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition duration-300 ease-in-out"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const finalPrice = Number(product.price || 0) - Number(product.discount || 0);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && activeImage < gallery.length - 1) setActiveImage(activeImage + 1);
    if (distance < -50 && activeImage > 0) setActiveImage(activeImage - 1);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const sizeBtn = (isOn) =>
    `min-w-[3rem] px-4 py-3 text-sm font-semibold border transition-all duration-200 ease-in-out rounded-lg ${
      isOn
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 bg-white"
    }`;

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 sm:pb-8 text-neutral-900">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 lg:items-start">
        <div className="w-full lg:sticky lg:top-28 space-y-4">
          <div
            className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 cursor-zoom-in group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsFullScreenOpen(true)}
          >
            <div className="aspect-[3/4] sm:aspect-[4/5] max-h-[85vh]">
              <img
                src={gallery[activeImage] || FALLBACK_IMAGE}
                alt={product.name || "Product"}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03]"
                onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                loading="eager"
                decoding="async"
              />
            </div>
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase bg-sky-400 text-black px-2 py-1 font-bold">
                −{Math.round((product.discount / product.price) * 100)}%
              </span>
            )}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(activeImage > 0 ? activeImage - 1 : gallery.length - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 text-neutral-900 p-2.5 border border-neutral-200 shadow-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out hidden sm:block"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(activeImage < gallery.length - 1 ? activeImage + 1 : 0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 text-neutral-900 p-2.5 border border-neutral-200 shadow-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in-out hidden sm:block"
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-[10px] uppercase tracking-widest px-3 py-1 sm:hidden">
              {activeImage + 1} / {gallery.length}
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {gallery.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border-2 transition duration-200 ease-in-out ${
                    activeImage === idx ? "border-neutral-900" : "border-neutral-200 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img || FALLBACK_IMAGE}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8 lg:sticky lg:top-28">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
              {product.Category?.name || product.brand || "Studio"}
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-[0.04em] text-neutral-900 leading-[1.05]">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-4 border-b border-neutral-200 pb-8">
            <span className="text-3xl sm:text-4xl font-bold text-neutral-900 tabular-nums">₹{finalPrice.toFixed(0)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-neutral-400 line-through tabular-nums">₹{Number(product.price || 0).toFixed(0)}</span>
                <span className="text-xs uppercase tracking-widest text-neutral-500">Save ₹{Number(product.discount || 0).toFixed(0)}</span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-neutral-600 leading-relaxed max-w-prose">{product.description}</p>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} type="button" onClick={() => setSelectedSize(size)} className={sizeBtn(selectedSize === size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-3">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} type="button" onClick={() => setSelectedColor(color)} className={sizeBtn(selectedColor === color)}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-3">Qty</p>
            <div className="inline-flex items-center gap-0 border border-neutral-200 rounded-lg overflow-hidden w-fit bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition ease-in-out"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.inventory || 99, quantity + 1))}
                className="w-12 h-12 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition ease-in-out"
              >
                +
              </button>
            </div>
            {product.inventory != null && (
              <p className="text-xs text-neutral-500 mt-2">{product.inventory} in stock</p>
            )}
          </div>

          {feedback && (
            <div
              className={`text-sm font-medium px-4 py-3 border ${
                feedback.includes("Added") ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30" : "border-red-500/40 text-red-300 bg-red-950/20"
              }`}
            >
              {feedback}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => addToCart.mutate()}
              disabled={
                addToCart.isLoading || (product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)
              }
              className="w-full bg-neutral-900 text-white py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 ease-in-out active:scale-[0.99] rounded-lg"
            >
              {addToCart.isLoading ? "Adding…" : "Add to cart"}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  addToCart.mutate(undefined, {
                    onSuccess: () => navigate("/checkout"),
                  });
                }}
                disabled={
                  addToCart.isLoading || (product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)
                }
                className="py-3.5 text-xs font-bold uppercase tracking-[0.2em] border border-neutral-900 text-neutral-900 hover:bg-neutral-50 disabled:opacity-40 transition duration-300 ease-in-out rounded-lg"
              >
                Buy now
              </button>
              <button
                type="button"
                onClick={() => wishlistMutation.mutate()}
                disabled={wishlistMutation.isPending}
                className="py-3.5 text-xs font-bold uppercase tracking-[0.2em] border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-40 transition duration-300 ease-in-out rounded-lg"
              >
                {wishlistMutation.isPending ? "…" : "Wishlist"}
              </button>
            </div>
          </div>

          <ul className="text-xs text-neutral-500 space-y-2 border-t border-neutral-200 pt-8 uppercase tracking-widest">
            <li>Free ship · ₹1499+</li>
            <li>Returns · 7 days</li>
            <li>Ships from · Tirupur</li>
          </ul>
        </div>
      </div>

      <FullScreenImageViewer
        images={gallery}
        initialIndex={activeImage}
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
      />
    </div>
  );
}
