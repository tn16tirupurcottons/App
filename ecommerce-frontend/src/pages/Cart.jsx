import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getProductImage, handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

export default function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState(() => localStorage.getItem("tn16_applied_coupon") || "");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: null, text: "" });
  const [discountedSubtotal, setDiscountedSubtotal] = useState(null);

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

  // Eligible coupons are filtered server-side using insider status + cart rules.
  const { data: eligibleCouponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ["eligibleCoupons", summary?.subtotal],
    enabled: !!data,
    queryFn: async () => {
      const res = await axiosClient.get("/coupons/eligible");
      return res.data?.items || [];
    },
  });
  const eligibleCoupons = eligibleCouponsData || [];

  // Keep frontend totals in sync with a backend-validated discounted subtotal.
  const effective = useMemo(() => {
    const sub = discountedSubtotal != null ? discountedSubtotal : summary.subtotal;
    const taxTotal = Number((sub * 0.05).toFixed(2));
    const shippingFee = sub === 0 || sub >= 1999 ? 0 : 59;
    const payable = sub + taxTotal + shippingFee;
    return { subtotal: sub, taxTotal, shippingFee, payable };
  }, [discountedSubtotal, summary.subtotal]);

  const lastSubtotalRef = useRef(null);
  useEffect(() => {
    // If cart subtotal changes due to user actions, drop any previously applied coupon.
    // Avoid clearing immediately on first mount.
    if (lastSubtotalRef.current != null) {
      if (lastSubtotalRef.current !== summary?.subtotal && appliedCouponCode) {
        setDiscountedSubtotal(null);
        setAppliedCouponCode("");
        setCouponInput("");
        localStorage.removeItem("tn16_applied_coupon");
      }
    }
    lastSubtotalRef.current = summary?.subtotal;
  }, [summary?.subtotal, appliedCouponCode]);

  const update = useMutation({
    mutationFn: ({ id, quantity }) =>
      axiosClient.put(`/cart/${id}`, { quantity }),
    onSuccess: () => {
      setDiscountedSubtotal(null);
      setAppliedCouponCode("");
      setCouponInput("");
      localStorage.removeItem("tn16_applied_coupon");
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => axiosClient.delete(`/cart/${id}`),
    onSuccess: () => {
      setDiscountedSubtotal(null);
      setAppliedCouponCode("");
      setCouponInput("");
      localStorage.removeItem("tn16_applied_coupon");
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8 text-dark">
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

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Promo code"
              className="flex-1 border border-border bg-white rounded-full px-3 py-2 text-sm text-dark focus:outline-none"
              autoCapitalize="characters"
            />
            <button
              type="button"
              onClick={async () => {
                setCouponMessage({ type: null, text: "" });
                const code = String(couponInput || "").trim().toUpperCase();
                if (!code) {
                  setCouponMessage({ type: "error", text: "Enter a promo code" });
                  return;
                }
                setCouponApplying(true);
                try {
                  const res = await axiosClient.post("/coupons/apply", {
                    code,
                    cart_total: summary.subtotal,
                  });
                  const { final_total, discount } = res.data || {};
                  if (!Number.isFinite(final_total)) {
                    throw new Error("Unable to apply coupon");
                  }
                  setDiscountedSubtotal(Number(final_total));
                  setAppliedCouponCode(code);
                  localStorage.setItem("tn16_applied_coupon", code);
                  setCouponMessage({
                    type: "success",
                    text: `Applied ${code} • Save ₹${Math.round(Number(discount || 0))}`,
                  });
                } catch (err) {
                  setCouponMessage({
                    type: "error",
                    text:
                      err.response?.data?.message ||
                      err.message ||
                      "Failed to apply coupon",
                  });
                } finally {
                  setCouponApplying(false);
                }
              }}
              disabled={couponApplying || !couponInput.trim()}
              className="shrink-0 bg-neutral-900 text-white px-4 py-2 text-xs sm:text-sm rounded-full font-semibold uppercase tracking-wide hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {couponApplying ? "Applying..." : "Apply"}
            </button>
          </div>

          {couponMessage.type ? (
            <div
              className={`text-sm rounded-xl px-3 py-2 ${
                couponMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {couponMessage.text}
            </div>
          ) : null}

          {appliedCouponCode ? (
            <button
              type="button"
              onClick={() => {
                setDiscountedSubtotal(null);
                setAppliedCouponCode("");
                setCouponInput("");
                localStorage.removeItem("tn16_applied_coupon");
                setCouponMessage({ type: null, text: "" });
              }}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
            >
              Remove coupon
            </button>
          ) : null}

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mb-2">Promos</p>
            <div className="space-y-2">
              {couponsLoading ? (
                <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
              ) : eligibleCoupons.length ? (
                eligibleCoupons.slice(0, 4).map((c) => {
                  const active = c.code === appliedCouponCode;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCouponInput(c.code)}
                      className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white hover:border-neutral-300 text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-neutral-900"}`}>
                            {c.code}
                          </p>
                          <p className={`text-xs mt-0.5 ${active ? "text-neutral-100" : "text-neutral-600"} truncate`}>
                            Save ₹{Math.round(Number(c.discount_amount_preview || 0))}
                          </p>
                        </div>
                        {c.is_insider_only ? (
                          <span className={`text-[10px] uppercase tracking-[0.22em] rounded-full px-2 py-1 border ${active ? "border-neutral-200 text-neutral-100" : "border-neutral-200 text-neutral-700"}`}>
                            Insider
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-neutral-600">No promos available for your cart.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-dark/70">
          <SummaryRow label="Subtotal" value={effective.subtotal} />
          <SummaryRow label="Tax (5%)" value={effective.taxTotal} />
          <SummaryRow label="Shipping" value={effective.shippingFee} />
        </div>
        <div className="border-t border-border mt-4 pt-4 flex justify-between text-lg font-semibold text-dark">
          <span>Total</span>
          <span className="text-primary">₹{Number(effective.payable || 0).toFixed(0)}</span>
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
