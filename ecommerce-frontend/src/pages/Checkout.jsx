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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axiosClient.post("/orders/checkout");
        setClientSecret(res.data.clientSecret);
        setOrderData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to start checkout");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="p-8 text-center">Preparing checkout…</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Stripe not configured."}
      </div>
    );

  if (!clientSecret || !stripePromise) {
    return (
      <div className="p-8 text-center text-gray-500">
        Checkout temporarily unavailable. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
      <OrderSummary orderData={orderData} />
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm orderData={orderData} />
      </Elements>
    </div>
  );
}

function OrderSummary({ orderData }) {
  const items = orderData?.items || [];
  const totals = orderData?.totals || {};

  return (
    <div className="bg-white rounded-3xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Order summary</h2>
      <div className="space-y-3 max-h-80 overflow-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-gray-800">{item.Product?.name}</p>
              <p className="text-gray-500 text-xs">
                Qty {item.quantity} · ₹{item.unitPrice?.toFixed(0)}
              </p>
            </div>
            <p className="font-semibold text-gray-700">
              ₹{(item.quantity * (item.unitPrice || 0)).toFixed(0)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t mt-4 pt-4 space-y-2 text-sm text-gray-600">
        <SummaryRow label="Subtotal" value={totals.subtotal} />
        <SummaryRow label="Tax (5%)" value={totals.taxTotal} />
        <SummaryRow label="Shipping" value={totals.shippingFee} />
      </div>
      <div className="flex justify-between text-lg font-bold mt-4">
        <span>Total</span>
        <span>₹{Number(totals.total || 0).toFixed(0)}</span>
      </div>
    </div>
  );
}

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
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const handleChange = (field, value) =>
    setShipping((prev) => ({ ...prev, [field]: value }));

  const canSubmit = useMemo(() => {
    return (
      Object.values({
        name: shipping.name,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zip: shipping.zip,
      }).every(Boolean) && stripe && elements
    );
  }, [shipping, stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
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

    try {
      await axiosClient.post("/orders", {
        paymentIntentId: paymentIntent?.id || orderData.paymentIntentId,
        shipping,
      });
      qc.invalidateQueries(["cart"]);
      qc.invalidateQueries(["orders"]);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Order placed successfully 🎉
        </h2>
        <p className="text-gray-600 mt-2">
          We’ll keep you posted once your Tirupur cotton fit ships.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow p-6 space-y-4"
    >
      <h2 className="text-xl font-bold mb-2">Shipping & Payment</h2>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Full name"
          value={shipping.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <Input
          label="Phone"
          value={shipping.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <Input
          label="Address"
          value={shipping.address}
          onChange={(e) => handleChange("address", e.target.value)}
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

      <div className="border rounded-2xl p-4">
        <PaymentElement />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full bg-pink-600 text-white py-3 rounded-full font-semibold disabled:opacity-40"
        >
          {submitting ? "Processing..." : "Confirm & Pay"}
        </button>
    </form>
  );
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`text-sm font-semibold text-gray-700 ${className}`}>
      <span className="block mb-1">{label}</span>
      <input
        {...props}
        className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>₹{Number(value || 0).toFixed(0)}</span>
    </div>
  );
}
