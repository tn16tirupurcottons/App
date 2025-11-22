import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { getProductImage, handleImageError, FALLBACK_IMAGES } from "../utils/imageUtils";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📦" },
  { key: "confirmed", label: "Confirmed", icon: "✓" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const PAYMENT_STATUS = {
  requires_payment: { label: "Payment Required", color: "text-yellow-600" },
  processing: { label: "Processing", color: "text-blue-600" },
  paid: { label: "Paid", color: "text-green-600" },
  failed: { label: "Failed", color: "text-red-600" },
};

export default function OrderTracking() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/orders/${id}`);
      if (!res.data.order) throw new Error("Order not found");
      return res.data.order;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="card p-8 text-center">
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-dark mb-2">Order Not Found</h2>
          <p className="text-muted mb-4">The order you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-transform text-xs sm:text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const order = data;
  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const paymentStatus = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.requires_payment;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 pb-24 sm:pb-6 md:pb-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-4"
        >
          ← Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-display text-dark mb-2">Order Tracking</h1>
        <p className="text-sm sm:text-base text-muted">
          Order ID: <span className="font-semibold text-dark">{order.id.substring(0, 8).toUpperCase()}</span>
        </p>
      </div>

      {/* Status Timeline */}
      <div className="card p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-dark mb-4 sm:mb-6">Order Status</h2>
        <div className="space-y-4">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold transition ${
                  isCompleted
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-400"
                }`}>
                  {isCompleted && !isCurrent ? "✓" : step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-semibold ${
                    isCurrent ? "text-primary" : isCompleted ? "text-dark" : "text-muted"
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs sm:text-sm text-muted mt-1">
                      Your order is currently {step.label.toLowerCase()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Status */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted mb-1">Payment Status</h3>
            <p className={`text-lg font-semibold ${paymentStatus.color}`}>
              {paymentStatus.label}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-muted mb-1">Payment Method</h3>
            <p className="text-lg font-semibold text-dark">
              {order.paymentMethod === "cod" ? "💰 Cash on Delivery" : "💳 Online Payment"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-dark mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.OrderItems?.map((item) => {
            const categoryName = item.Product?.Category?.name || "";
            const image = getProductImage(item.Product, categoryName);
            
            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                <img
                  src={image}
                  alt={item.Product?.name || "Product"}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => handleImageError(e, FALLBACK_IMAGES.product)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-dark">{item.Product?.name}</h3>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    Quantity: {item.quantity}
                    {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    {item.selectedColor && ` • Color: ${item.selectedColor}`}
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-primary mt-2">
                    ₹{(item.unitPrice * item.quantity).toFixed(0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Details */}
      <div className="card p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-dark mb-4">Shipping Address</h2>
        <div className="space-y-2 text-sm sm:text-base text-dark/70">
          <p className="font-semibold text-dark">{order.shippingName}</p>
          <p>{order.shippingAddress}</p>
          <p>
            {order.shippingCity}, {order.shippingState} - {order.shippingZip}
          </p>
          <p>{order.shippingCountry}</p>
          <p className="mt-2">Phone: {order.shippingPhone}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-dark mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between text-dark/70">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal || 0).toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-dark/70">
            <span>Tax (5%)</span>
            <span>₹{Number(order.taxTotal || 0).toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-dark/70">
            <span>Shipping</span>
            <span>₹{Number(order.shippingFee || 0).toFixed(0)}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between text-lg font-semibold text-dark">
            <span>Total</span>
            <span className="text-primary">₹{Number(order.total || 0).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="flex-1 text-center border-2 border-border text-dark py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
