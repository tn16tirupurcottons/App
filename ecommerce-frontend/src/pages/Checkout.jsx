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
import LocationSelect from "../components/LocationSelect";

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
        const res = await axiosClient.post("/orders/checkout", {
          paymentMethod: "cod", // Request COD by default
        });
        setClientSecret(res.data.clientSecret || "");
        setOrderData(res.data);
        // Set demo mode if COD or if no payment gateway is available
        const isCOD = res.data.paymentMethod === "cod" || res.data.paymentIntentId?.startsWith("cod_");
        setDemoMode(Boolean(res.data.demoMode) || isCOD || !res.data.clientSecret);
      } catch (err) {
        console.error("Checkout initialization error:", err);
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
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-dark mb-2">Checkout Error</h2>
          <p className="text-red-600">{error || "Stripe not configured."}</p>
          <button
            onClick={() => window.location.href = "/cart"}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );

  if (!orderData) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-dark mb-2">No Items to Checkout</h2>
          <p className="text-muted">Your cart is empty. Add items to proceed.</p>
          <button
            onClick={() => window.location.href = "/catalog"}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // COD mode doesn't need Stripe - allow checkout to proceed
  if (!demoMode && orderData?.paymentMethod !== "cod" && (!clientSecret || !stripePromise)) {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-dark mb-2">Payment Unavailable</h2>
          <p className="text-sm sm:text-base text-muted">Checkout temporarily unavailable. Please try again later.</p>
          <button
            onClick={() => window.location.href = "/cart"}
            className="mt-4 bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-transform text-xs sm:text-sm"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 pb-24 sm:pb-6 md:pb-0">
      <div className="lg:order-2">
        <OrderSummary orderData={orderData} />
      </div>
      <div className="lg:order-1">
        {demoMode || orderData?.paymentMethod === "cod" ? (
          <CheckoutFormWrapper orderData={orderData} isDemoMode={true} />
        ) : stripePromise && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutFormWrapper orderData={orderData} isDemoMode={false} />
          </Elements>
        ) : (
          // Fallback to COD if Stripe is not available
          <CheckoutFormWrapper orderData={orderData} isDemoMode={true} />
        )}
      </div>
    </div>
  );
}

// Wrapper component to handle conditional hook usage
function CheckoutFormWrapper({ orderData, isDemoMode = false }) {
  if (isDemoMode) {
    return <CheckoutFormDemo orderData={orderData} />;
  }
  return <CheckoutForm orderData={orderData} />;
}

// Demo mode form (no Stripe hooks)
function CheckoutFormDemo({ orderData }) {
  const qc = useQueryClient();
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

  if (!orderData) {
    return (
      <div className="card p-6">
        <p className="text-muted">Loading checkout form...</p>
      </div>
    );
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!orderData) {
        setError("Order data is missing. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      const shippingPayload = {
        ...shipping,
        address: shipping.address2
          ? `${shipping.address}\n${shipping.address2}`
          : shipping.address,
      };
      delete shippingPayload.address2;

      // For COD, paymentIntentId might be a generated ID, which is fine
      const orderPayload = {
        paymentIntentId: orderData.paymentIntentId || `cod_${Date.now()}`,
        paymentMethod: orderData.paymentMethod || "cod",
        shipping: shippingPayload,
      };

      await axiosClient.post("/orders", orderPayload);
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
      <div className="card p-4 sm:p-6 text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-dark">
          Order placed successfully 🎉
        </h2>
        <p className="text-sm sm:text-base text-muted mt-2">
          We'll keep you posted once your Tirupur cotton fit ships.
        </p>
        {orderData?.paymentMethod === "cod" && (
          <p className="text-xs sm:text-sm text-muted mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            💰 Cash on Delivery: Please keep exact change ready when your order arrives.
          </p>
        )}
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-3 sm:space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-dark">Shipping Details</h2>
      {orderData?.paymentMethod === "cod" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs sm:text-sm text-blue-800">
            💰 <strong>Cash on Delivery:</strong> Pay when you receive your order. No payment required now.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="col-span-1 sm:col-span-2 space-y-3">
          <LocationSelect
            country={shipping.country}
            state={shipping.state}
            city={shipping.city}
            onStateChange={(val) => handleChange("state", val)}
            onCityChange={(val) => handleChange("city", val)}
            required
          />
        </div>
        <Input
          label="Postal code"
          value={shipping.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
          className="col-span-1 sm:col-span-2"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!shippingValid || submitting}
        className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-full font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-transform"
      >
        {submitting ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}

function OrderSummary({ orderData }) {
  if (!orderData) {
    return (
      <div className="card p-6">
        <p className="text-muted">Loading order summary...</p>
      </div>
    );
  }
  
  const items = orderData?.items || [];
  const totals = orderData?.totals || {};

  return (
    <div className="card p-4 sm:p-6 sticky top-20 sm:top-24">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-dark">Order summary</h2>
      <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-auto pr-2 text-dark/70">
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

// Stripe mode form (uses Stripe hooks)
function CheckoutForm({ orderData }) {
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

  if (!orderData) {
    return (
      <div className="card p-6">
        <p className="text-muted">Loading checkout form...</p>
      </div>
    );
  }

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

  const canSubmit = shippingValid && stripe && elements;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Payment session unavailable. Please refresh.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      if (!orderData || !orderData.paymentIntentId) {
        setError("Order data is missing. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

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

      const paymentIntentId = paymentIntent?.id || orderData.paymentIntentId;

      const shippingPayload = {
        ...shipping,
        address: shipping.address2
          ? `${shipping.address}\n${shipping.address2}`
          : shipping.address,
      };
      delete shippingPayload.address2;

      // Determine payment method from orderData
      const paymentMethod = orderData.paymentMethod || (paymentIntentId?.startsWith("cod_") ? "cod" : "stripe");
      
      const orderPayload = {
        paymentIntentId,
        paymentMethod,
        shipping: shippingPayload,
      };

      await axiosClient.post("/orders", orderPayload);
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
      className="card p-4 sm:p-6 space-y-3 sm:space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-dark">Shipping & Payment</h2>
      {orderData?.paymentMethod === "cod" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs sm:text-sm text-blue-800">
            💰 <strong>Cash on Delivery:</strong> Pay when you receive your order. No payment required now.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full name"
          value={shipping.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="sm:col-span-1"
        />
        <Input
          label="Phone"
          value={shipping.phone}
          inputMode="tel"
          maxLength={12}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="sm:col-span-1"
        />
        <Input
          label="Address"
          value={shipping.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="col-span-1 sm:col-span-2"
        />
        <Input
          label="Apartment / Suite (optional)"
          value={shipping.address2}
          onChange={(e) => handleChange("address2", e.target.value)}
          className="col-span-1 sm:col-span-2"
        />
        <div className="col-span-1 sm:col-span-2 space-y-3">
          <LocationSelect
            country={shipping.country}
            state={shipping.state}
            city={shipping.city}
            onStateChange={(val) => handleChange("state", val)}
            onCityChange={(val) => handleChange("city", val)}
            required
          />
        </div>
        <Input
          label="Postal code"
          value={shipping.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
          className="col-span-1 sm:col-span-2"
        />
      </div>

      <div className="border border-border rounded-2xl p-4 bg-light">
        <PaymentElement />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-full font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-transform"
      >
        {submitting ? "Processing..." : "Confirm & Pay"}
      </button>
    </form>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`block text-xs sm:text-sm font-semibold text-dark/70 ${className}`}>
      <span className="block mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full border border-border bg-white rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-dark focus:outline-none focus:border-primary"
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
