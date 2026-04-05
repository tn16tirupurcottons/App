import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getProductImage, FALLBACK_IMAGES, isValidImageUrl, normalizeImageArray } from "../utils/imageUtils";
import { isUuid } from "../utils/validation";
import ProductGallery from "../components/ProductGallery.jsx";
import ProductCard from "../components/ProductCard";
import VirtualTryOn from "../components/VirtualTryOn";
import ARViewer from "../components/ARViewer";
import AiStylistSection from "../components/AiStylistSection";

const FALLBACK_IMAGE = FALLBACK_IMAGES.product;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/products/${id}`);
      return res.data;
    },
    retry: 2,
  });

  const categoryName = product?.Category?.name || product?.category?.name || "";

  const mediaItems = useMemo(() => {
    if (!product) return [{ type: "image", src: FALLBACK_IMAGE }];

    const validImage = (src) => isValidImageUrl(src);
    const normalizeImages = normalizeImageArray;
    const uniqueImages = [];
    const addImage = (src) => {
      if (!validImage(src) || uniqueImages.includes(src)) return;
      uniqueImages.push(src);
    };

    const primaryImage = getProductImage(product, categoryName);
    addImage(primaryImage);

    const galleryImages = normalizeImages(product.gallery);
    galleryImages.forEach(addImage);

    addImage(product.thumbnail);

    const items = uniqueImages.length > 0 ? uniqueImages.map((src) => ({ type: "image", src })) : [{ type: "image", src: FALLBACK_IMAGE }];

    if (product.videoUrl) {
      items.push({ type: "video", src: product.videoUrl });
    }

    if (Array.isArray(product.spinImages) && product.spinImages.length > 0) {
      const validFrames = product.spinImages.filter(validImage);
      if (validFrames.length > 0) {
        items.push({ type: "spin", frames: validFrames });
      }
    }

    return items;
  }, [product, categoryName]);

  const normalizedTryOnImages = useMemo(() => normalizeImageArray(product?.tryOnImages), [product?.tryOnImages]);
  const normalizedSpinImages = useMemo(() => normalizeImageArray(product?.spinImages), [product?.spinImages]);

  const hasTryOnImage = useMemo(() => normalizedTryOnImages.some(isValidImageUrl), [normalizedTryOnImages]);

  const hasARModel = Boolean(product?.model3dUrl || product?.arModelUrl);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);

  useEffect(() => {
    if (product?.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product?.colors?.length) setSelectedColor(product.colors[0]);
    setSelectedMediaIndex(0);
  }, [product]);

  useEffect(() => {
    if (!hasTryOnImage) setTryOnOpen(false);
    if (!hasARModel) setArOpen(false);
  }, [hasTryOnImage, hasARModel]);

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

  const { data: recommendedResponse } = useQuery({
    queryKey: ["recommended", product?.categoryId || "global"],
    queryFn: async () => {
      const categoryQuery = product?.categoryId ? `?categoryId=${product.categoryId}` : "";
      const userId = user?.id || "guest";
      const res = await axiosClient.get(`/products/recommended/${userId}${categoryQuery}`);
      return res.data;
    },
    enabled: Boolean(product),
    staleTime: 1000 * 60 * 5,
  });

  const recommended = (recommendedResponse?.items || [])
    .filter((item) => item.id !== product?.id)
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8 py-4">
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

  const sizeBtn = (isOn) =>
    `min-w-[3rem] px-4 py-3 text-sm font-semibold border transition-all duration-200 ease-in-out rounded-lg ${
      isOn
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 bg-white"
    }`;

  return (
    <div className="w-full pb-24 sm:pb-8 text-neutral-900">
      <div className="container">
        <div className="product-page">
          <aside className="thumbnail-list">
            {mediaItems.map((item, index) => {
              const isActive = index === selectedMediaIndex;
              const thumbSrc = item.type === "spin" ? item.frames[0] : item.src;
              return (
                <button
                  key={`${item.type}-${index}`}
                  type="button"
                  className={`thumbnail overflow-hidden rounded-lg border transition ${
                    isActive ? "border-neutral-900 shadow-sm" : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  onClick={() => setSelectedMediaIndex(index)}
                >
                  <img
                    src={thumbSrc}
                    alt={`${item.type} thumbnail ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              );
            })}
          </aside>

          <section className="main-image">
            <ProductGallery
              images={mediaItems.filter((item) => item.type === "image").map((item) => item.src)}
              spinImages={normalizedSpinImages}
              videoUrl={product?.videoUrl || ""}
              productName={product?.name || ""}
              selectedIndex={selectedMediaIndex}
              onSelectedIndexChange={setSelectedMediaIndex}
              showThumbnails={false}
              onImageClick={() => null}
            />
          </section>

          <section className="product-info space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
                {product.Category?.name || product.brand || "Studio"}
              </p>
              <h1 className="product-title mt-3 text-neutral-900">
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

            <div className="flex flex-wrap gap-3 mt-4 mb-8">
              {hasTryOnImage && (
                <button
                  type="button"
                  onClick={() => setTryOnOpen((v) => !v)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-semibold bg-white hover:bg-neutral-50 transition duration-200 ease-in-out"
                >
                  Try On
                </button>
              )}
              {hasARModel && (
                <button
                  type="button"
                  onClick={() => setArOpen((v) => !v)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-semibold bg-white hover:bg-neutral-50 transition duration-200 ease-in-out"
                >
                  View in AR
                </button>
              )}
            </div>

            {tryOnOpen && (
              <div>
                {hasTryOnImage ? (
                  <VirtualTryOn
                    overlayImage={normalizedTryOnImages.find(isValidImageUrl) || ""}
                  />
                ) : (
                  <div className="rounded-xl border border-neutral-200 p-4 bg-white text-sm text-neutral-600">
                    Virtual try-on is not available for this product.
                  </div>
                )}
              </div>
            )}

            {arOpen && (
              <div>
                {hasARModel ? (
                  <ARViewer model3dUrl={product.model3dUrl} arModelUrl={product.arModelUrl} />
                ) : (
                  <div className="rounded-xl border border-neutral-200 p-4 bg-white text-sm text-neutral-600">
                    3D product preview is not available for this item.
                  </div>
                )}
              </div>
            )}

            <AiStylistSection userId={user?.id} />

            {recommended.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-neutral-900 mb-3">Recommended for you</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {recommended.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="buy-box">
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Deal price</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-neutral-900 tabular-nums">₹{finalPrice.toFixed(0)}</span>
                  {product.discount > 0 && (
                    <span className="text-sm text-neutral-400 line-through tabular-nums">₹{Number(product.price || 0).toFixed(0)}</span>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-neutral-500">You save ₹{Number(product.discount || 0).toFixed(0)}</p>
                )}
              </div>

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
          </aside>
        </div>
      </div>
    </div>
  );
}
