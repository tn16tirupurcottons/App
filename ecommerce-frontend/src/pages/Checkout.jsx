import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
const stripePromise = publicKey ? loadStripe(publicKey) : null;

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axiosClient.post("/orders/checkout");
        setClientSecret(res.data.clientSecret || "");
        setOrderData(res.data);
        setDemoMode(Boolean(res.data.demoMode));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to start checkout");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="p-8 text-center text-dark">Preparing checkout…</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Stripe not configured."}
      </div>
    );

  if (!demoMode && (!clientSecret || !stripePromise)) {
    return (
      <div className="p-8 text-center text-muted">
        Checkout temporarily unavailable. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
      <OrderSummary orderData={orderData} />
      {demoMode ? (
        <CheckoutForm orderData={orderData} isDemoMode />
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderData={orderData} />
        </Elements>
      )}
    </div>
  );
}

function OrderSummary({ orderData }) {
  const items = orderData?.items || [];
  const totals = orderData?.totals || {};

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4 text-dark">Order summary</h2>
      <div className="space-y-3 max-h-80 overflow-auto pr-2 text-dark/70">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-dark">{item.Product?.name}</p>
              <p className="text-muted text-xs">
                Qty {item.quantity} · ₹{item.unitPrice?.toFixed(0)}
              </p>
            </div>
            <p className="font-semibold text-dark">
              ₹{(item.quantity * (item.unitPrice || 0)).toFixed(0)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm text-dark/70">
        <SummaryRow label="Subtotal" value={totals.subtotal} />
        <SummaryRow label="Tax (5%)" value={totals.taxTotal} />
        <SummaryRow label="Shipping" value={totals.shippingFee} />
      </div>
      <div className="flex justify-between text-lg font-semibold mt-4 text-dark">
        <span>Total</span>
        <span className="text-primary">₹{Number(totals.total || 0).toFixed(0)}</span>
      </div>
    </div>
  );
}

function CheckoutForm({ orderData, isDemoMode = false }) {
  const qc = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const handleChange = (field, value) =>
    setShipping((prev) => ({ ...prev, [field]: value }));

  const shippingValid = useMemo(() => {
    const required = {
      name: shipping.name.trim(),
      phone: shipping.phone.trim(),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      zip: shipping.zip.trim(),
    };
    return Object.values(required).every(Boolean);
  }, [shipping]);

  const canSubmit = isDemoMode
    ? shippingValid
    : shippingValid && stripe && elements;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDemoMode && (!stripe || !elements)) {
      setError("Payment session unavailable. Please refresh.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let paymentIntentId = orderData.paymentIntentId;

      if (!isDemoMode) {
        const { error: stripeError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            redirect: "if_required",
            confirmParams: {
              payment_method_data: {
                billing_details: {
                  name: shipping.name,
                  phone: shipping.phone,
                },
              },
            },
          });

        if (stripeError) {
          setError(stripeError.message || "Payment failed");
          setSubmitting(false);
          return;
        }

        paymentIntentId = paymentIntent?.id || orderData.paymentIntentId;
      }

      const shippingPayload = {
        ...shipping,
        address: shipping.address2
          ? `${shipping.address}\n${shipping.address2}`
          : shipping.address,
      };
      delete shippingPayload.address2;

      await axiosClient.post("/orders", {
        paymentIntentId,
        shipping: shippingPayload,
      });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-xl font-semibold text-dark">
          Order placed successfully 🎉
        </h2>
        <p className="text-muted mt-2">
          We'll keep you posted once your Tirupur cotton fit ships.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 bg-primary text-white px-6 py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs hover:bg-primary/90"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold mb-2 text-dark">Shipping & Payment</h2>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Full name"
          value={shipping.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Input
          label="Phone"
          value={shipping.phone}
          inputMode="tel"
          maxLength={12}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <Input
          label="Address"
          value={shipping.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="col-span-2"
        />
        <Input
          label="Apartment / Suite (optional)"
          value={shipping.address2}
          onChange={(e) => handleChange("address2", e.target.value)}
          className="col-span-2"
        />
        <Input
          label="City"
          value={shipping.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />
        <Input
          label="State"
          value={shipping.state}
          onChange={(e) => handleChange("state", e.target.value)}
        />
        <Input
          label="Postal code"
          value={shipping.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
        />
        <Input
          label="Country"
          value={shipping.country}
          onChange={(e) => handleChange("country", e.target.value)}
        />
      </div>

      {!isDemoMode && (
        <div className="border border-border rounded-2xl p-4 bg-light">
          <PaymentElement />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-40 hover:bg-primary/90"
        >
          {submitting
            ? "Processing..."
            : isDemoMode
            ? "Place Order"
            : "Confirm & Pay"}
        </button>
    </form>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`text-sm font-semibold text-dark/70 ${className}`}>
      <span className="block mb-1">{label}</span>
      <input
        {...props}
        className="w-full border border-border bg-white rounded-full px-4 py-2 text-sm text-dark focus:outline-none focus:border-primary"
      />
    </label>
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
