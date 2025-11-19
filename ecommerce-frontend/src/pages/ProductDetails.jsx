import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = React.useContext(AuthContext);
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");

  const { data: product, isLoading, error, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        const res = await axiosClient.get(`/products/${id}`);
        return res.data;
      } catch (err) {
        console.error("Product fetch error:", err);
        throw err;
      }
    },
    retry: 2,
  });

  const gallery = useMemo(() => {
    if (!product) return [FALLBACK_IMAGE];
    const images = [];
    if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
      images.push(...product.gallery);
    }
    if (product.thumbnail && !images.includes(product.thumbnail)) {
      images.unshift(product.thumbnail);
    }
    if (product.image && !images.includes(product.image)) {
      images.push(product.image);
    }
    return images.length > 0 ? images : [FALLBACK_IMAGE];
  }, [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [zoom, setZoom] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setActiveImage(0);
    setZoom(false);
  }, [id]);

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
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
      setFeedback("Added to bag! 🛍️");
      setTimeout(() => setFeedback(""), 3000);
    },
    onError: (err) => {
      if (err.response?.status === 401 || err.message === "AUTH_REQUIRED") {
        navigate("/login");
      } else {
        setFeedback(
          err.response?.data?.message || "Unable to add to bag right now."
        );
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
      return axiosClient.post("/wishlist", { productId: product.id });
    },
    onSuccess: (response) => {
      toast.success(response?.data?.message || "Saved to wishlist");
    },
    onError: (err) => {
      const message =
        err.message === "Please log in to save wishlist"
          ? err.message
          : err.response?.data?.message || "Unable to save to wishlist";
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-dark">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="h-[480px] bg-light rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-light rounded animate-pulse" />
            <div className="h-4 bg-light rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-light rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-dark">
        <div className="card p-12">
          <h2 className="text-2xl font-display mb-4 text-dark">Product Not Found</h2>
          <p className="text-muted mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/catalog"
            className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs hover:bg-primary/90"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice =
    Number(product.price || 0) - Number(product.discount || 0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeImage < gallery.length - 1) {
      setActiveImage(activeImage + 1);
    }
    if (isRightSwipe && activeImage > 0) {
      setActiveImage(activeImage - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 text-dark">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* Image Gallery */}
        <div>
          <div
            className="rounded-3xl overflow-hidden border border-border bg-light relative cursor-zoom-in shadow-soft"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setZoom(!zoom)}
          >
            <img
              src={gallery[activeImage] || FALLBACK_IMAGE}
              alt={product.name || "Product"}
              className={`w-full h-[400px] md:h-[480px] object-cover transition-transform ${
                zoom ? "scale-150" : "scale-100"
              }`}
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 text-[10px] tracking-[0.4em] uppercase bg-primary text-white px-2 py-1 rounded-full font-semibold">
                {Math.round((product.discount / product.price) * 100)}% off
              </span>
            )}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(activeImage > 0 ? activeImage - 1 : gallery.length - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white/80 p-2 rounded-full shadow-lg transition md:block hidden"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage(activeImage < gallery.length - 1 ? activeImage + 1 : 0);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white/80 p-2 rounded-full shadow-lg transition md:block hidden"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full md:hidden">
              {activeImage + 1} / {gallery.length}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 md:gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {gallery.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden border-2 transition ${
                    activeImage === idx
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border opacity-60 hover:opacity-100 hover:border-primary/40"
                  }`}
                >
                  <img
                    src={img || FALLBACK_IMAGE}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">
              {product.Category?.name || product.brand || "TN16 Collection"}
            </p>
            <h1 className="text-2xl md:text-3xl font-display mt-2 text-dark">
              {product.name || "Product"}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-primary">
              ₹{finalPrice.toFixed(0)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-muted line-through">
                  ₹{Number(product.price || 0).toFixed(0)}
                </span>
                <span className="text-sm font-semibold text-dark/70">
                  Save ₹{Number(product.discount || 0).toFixed(0)}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-semibold text-dark/70 mb-2">
                Description
              </h3>
              <p className="text-dark/70 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {product.brand && (
            <div className="text-sm text-dark/70">
              <span className="font-semibold">Brand:</span> {product.brand}
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-dark/70 mb-3">
                Select Size <span className="text-muted font-normal">(Required)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-full border-2 transition ${
                      selectedSize === size
                        ? "bg-primary text-white border-primary"
                        : "border-border text-dark/70 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-dark/70 mb-3">
                Select Color <span className="text-muted font-normal">(Required)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-2.5 rounded-full border-2 transition ${
                      selectedColor === color
                        ? "bg-primary text-white border-primary"
                        : "border-border text-dark/70 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.inventory || 5}
                value={quantity}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(product.inventory || 5, Number(e.target.value) || 1));
                  setQuantity(val);
                }}
                className="w-20 border border-border bg-white rounded-full px-4 py-2 text-center font-semibold text-dark"
              />
              <button
                onClick={() => setQuantity(Math.min(product.inventory || 5, quantity + 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary"
              >
                +
              </button>
            </div>
            {product.inventory && (
              <p className="text-xs text-muted mt-2">
                {product.inventory} available in stock
              </p>
            )}
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-3 rounded-lg text-sm font-semibold ${
              feedback.includes("Added") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {feedback}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => addToCart.mutate()}
              disabled={addToCart.isLoading || (product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
              {addToCart.isLoading ? "Adding..." : "Add to Bag 🛍️"}
            </button>
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                addToCart.mutate(undefined, {
                  onSuccess: () => navigate("/checkout"),
                });
              }}
              disabled={addToCart.isLoading || (product.sizes?.length && !selectedSize) || (product.colors?.length && !selectedColor)}
              className="flex-1 border-2 border-primary text-primary px-6 py-4 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5"
            >
              Buy Now
            </button>
            <button
              onClick={() => wishlistMutation.mutate()}
              disabled={wishlistMutation.isPending}
              className="flex-1 border border-border text-dark/70 px-6 py-4 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary"
            >
              {wishlistMutation.isPending ? "Saving..." : "Save to Wishlist"}
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-border space-y-3 text-sm text-dark/70">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Delivery:</span>
              <span>Free shipping on orders above ₹1499</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Returns:</span>
              <span>Easy 7-day returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Origin:</span>
              <span>Tirupur, Tamil Nadu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
