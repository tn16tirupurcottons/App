import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getProductImage, handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

export default function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axiosClient.get("/cart");
      return res.data;
    },
  });

  const items = data?.items || [];
  const summary = data?.summary || {
    subtotal: 0,
    taxTotal: 0,
    shippingFee: 0,
    payable: 0,
  };

  const update = useMutation({
    mutationFn: ({ id, quantity }) =>
      axiosClient.put(`/cart/${id}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const remove = useMutation({
    mutationFn: (id) => axiosClient.delete(`/cart/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-dark">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-light rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-dark">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 text-center">
          <p className="font-semibold mb-2 text-red-600">Error loading cart</p>
          <p className="text-sm text-red-600/70">
            {error.response?.data?.message || error.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 grid lg:grid-cols-3 gap-4 sm:gap-6 text-dark pb-24 sm:pb-6 md:pb-0">
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-display text-dark">Your TN16 bag</h2>
        {items.length === 0 ? (
          <div className="text-muted text-center py-8 sm:py-10 border border-border rounded-2xl card text-sm sm:text-base">
            Your cart is empty 🛍️
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 card p-3 sm:p-4"
            >
              <img
                src={getProductImage(item.Product, item.Product?.Category?.name)}
                alt={item.Product?.name || "Product"}
                className="w-full sm:w-20 md:w-24 h-48 sm:h-20 md:h-24 object-cover rounded-xl sm:flex-shrink-0"
                loading="lazy"
                onError={(e) => handleImageError(e, FALLBACK_IMAGES.product)}
              />
              <div className="flex-1 w-full sm:w-auto">
                <div className="font-semibold text-dark text-sm sm:text-base line-clamp-2">{item.Product?.name}</div>
                <div className="text-[10px] sm:text-[11px] text-muted uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
                  {item.selectedSize && `Size: ${item.selectedSize} `}
                  {item.selectedColor && `• Color: ${item.selectedColor}`}
                </div>
                <div className="text-xs sm:text-sm text-primary font-semibold mt-1">
                  ₹{(item.unitPrice || item.Product?.price || 0).toFixed(0)} each
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    update.mutate({
                      id: item.id,
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-16 sm:w-14 border border-border bg-white rounded px-2 py-1.5 sm:py-1 text-center text-dark text-sm"
                />
                <button
                  onClick={() => remove.mutate(item.id)}
                  className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted hover:text-primary px-2 sm:px-0"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-4 sm:p-6 h-fit sticky top-20 sm:top-24">
        <h3 className="text-lg font-semibold mb-4 text-dark">Order summary</h3>
        <div className="space-y-2 text-sm text-dark/70">
          <SummaryRow label="Subtotal" value={summary.subtotal} />
          <SummaryRow label="Tax (5%)" value={summary.taxTotal} />
          <SummaryRow label="Shipping" value={summary.shippingFee} />
        </div>
        <div className="border-t border-border mt-4 pt-4 flex justify-between text-lg font-semibold text-dark">
          <span>Total</span>
          <span className="text-primary">₹{Number(summary.payable || 0).toFixed(0)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          disabled={!items.length}
          className="w-full mt-4 sm:mt-6 bg-primary text-white py-3 sm:py-3.5 rounded-full font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-dark/70">
      <span>{label}</span>
      <span>₹{Number(value || 0).toFixed(0)}</span>
    </div>
  );
}
