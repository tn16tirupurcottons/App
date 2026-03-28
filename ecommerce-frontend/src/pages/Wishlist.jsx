import React from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useToast } from "../components/Toast";
import { getProductImage, handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

const FALLBACK_IMAGE = FALLBACK_IMAGES.product;

export default function Wishlist() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axiosClient.get("/wishlist");
      return res.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId) => axiosClient.delete(`/wishlist/${itemId}`),
    onSuccess: () => {
      toast.info("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to remove item");
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => axiosClient.delete("/wishlist"),
    onSuccess: () => {
      toast.success("Wishlist cleared");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to clear wishlist");
    },
  });

  const items = (data?.items || []).filter((item) => item.Product);
  const emptyState = !isLoading && items.length === 0;
  const removingId =
    removeMutation.isPending && removeMutation.variables
      ? removeMutation.variables
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 text-dark">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="pill text-muted">Saved edits</p>
          <h1 className="text-3xl font-display mt-1 text-dark">Your wishlist</h1>
          <p className="text-muted mt-2">
            Keep your TN16 favourites handy and move them to the bag when you're ready.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="px-4 py-2 rounded-full border border-border text-xs uppercase tracking-[0.3em] disabled:opacity-40 hover:border-primary hover:text-primary"
          >
            {clearMutation.isPending ? "Clearing..." : "Clear wishlist"}
          </button>
        )}
      </div>

      {isError && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700">
          {error?.message || error?.response?.data?.message || "Unable to fetch wishlist right now."}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {new Array(3).fill(null).map((_, idx) => (
            <div key={idx} className="h-28 bg-light rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              onRemove={(id) => removeMutation.mutate(id)}
              isRemoving={removingId === item.id}
            />
          ))}
        </div>
      )}

      {emptyState && (
        <div className="card p-10 text-center space-y-4">
          <h2 className="text-xl font-semibold text-dark">Your wishlist is empty</h2>
          <p className="text-muted max-w-xl mx-auto">
            Tap the heart icon on any product or explore the catalog to start
            saving Tirupur cotton looks you love.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white text-xs uppercase tracking-[0.3em] hover:bg-primary/90"
          >
            Browse catalog
          </Link>
        </div>
      )}
    </div>
  );
}

function WishlistItem({ item, onRemove, isRemoving }) {
  const product = item.Product;
  const categoryName = product?.Category?.name || product?.category?.name || "";
  const image = getProductImage(product, categoryName);
  const finalPrice =
    Number(product?.price || 0) - Number(product?.discount || 0);

  return (
    <div className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center">
      <Link
        to={`/product/${product?.id}`}
        className="flex items-center gap-4 w-full"
      >
        <img
          src={image}
          alt={product?.name || "Wishlist product"}
          className="w-24 h-24 object-cover rounded-2xl border border-border"
          loading="lazy"
          onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
        />
        <div className="flex-1 text-left">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            {product?.Category?.name || product?.brand || "TN16"}
          </p>
          <h3 className="text-lg font-semibold text-dark">{product?.name || "Product"}</h3>
          <p className="text-sm text-dark/60 line-clamp-2">
            {product?.shortDescription || product?.description}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">₹{finalPrice.toFixed(0)}</span>
            {product?.discount > 0 && (
              <span className="text-sm text-muted line-through">
                ₹{Number(product.price).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={() => onRemove(item.id)}
        disabled={isRemoving}
        className="w-full sm:w-auto px-5 py-2 rounded-full border border-border text-xs uppercase tracking-[0.3em] text-dark/70 hover:text-primary hover:border-primary disabled:opacity-40"
      >
        {isRemoving ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

