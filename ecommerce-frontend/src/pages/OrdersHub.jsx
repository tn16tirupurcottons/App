import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

/**
 * Entry point for "Orders" in nav: collect order id and open tracking (no new backend).
 */
export default function OrdersHub() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");
    const id = orderId.trim();
    if (!id) {
      setErrorMessage("Please enter order ID");
      return;
    }

    try {
      setLoading(true);
      console.log("[track-order] fetching order", id);
      await axiosClient.get(`/orders/${id}`);
      navigate(`/orders/${id}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setErrorMessage("Order not found");
      } else {
        setErrorMessage(err.response?.data?.message || err.message || "Failed to fetch order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 sm:py-10 px-1">
      <h1 className="text-2xl sm:text-3xl font-display font-semibold text-neutral-900 text-center mb-2">
        Track your order
      </h1>
      <p className="text-sm sm:text-base text-neutral-600 mb-8 text-center leading-relaxed">
        Enter the order ID from your confirmation email to see shipping status and details.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="order-id" className="block text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Order ID
        </label>
        <input
          id="order-id"
          type="text"
          autoComplete="off"
          placeholder="e.g. uuid from email"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-shadow duration-200"
        />
        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto min-h-12 rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "View order"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-neutral-500">
        <Link to="/catalog" className="font-medium text-neutral-800 underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
