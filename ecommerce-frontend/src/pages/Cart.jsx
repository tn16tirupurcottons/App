import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery(["cart"], async () => {
    const res = await axiosClient.get("/cart");
    return res.data;
  });

  const items = data?.items || [];
  const summary = data?.summary || {
    subtotal: 0,
    taxTotal: 0,
    shippingFee: 0,
    payable: 0,
  };

  const update = useMutation(
    async ({ id, quantity }) => axiosClient.put(`/cart/${id}`, { quantity }),
    {
      onSuccess: () => qc.invalidateQueries(["cart"]),
    }
  );

  const remove = useMutation(
    async (id) => axiosClient.delete(`/cart/${id}`),
    {
      onSuccess: () => qc.invalidateQueries(["cart"]),
    }
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold mb-2">
            Error loading cart
          </p>
          <p className="text-sm text-red-500">
            {error.response?.data?.message || error.message || "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">Your TN16 bag</h2>
        {items.length === 0 ? (
          <div className="text-gray-500 text-center py-10 bg-white rounded-xl shadow">
            Your cart is empty 🛍️
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <img
                src={
                  item.Product?.thumbnail ||
                  item.Product?.gallery?.[0] ||
                  "/placeholder.png"
                }
                alt={item.Product?.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {item.Product?.name}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                  {item.selectedSize && `Size: ${item.selectedSize} `}
                  {item.selectedColor && `• Color: ${item.selectedColor}`}
                </div>
                <div className="text-sm text-gray-500">
                  ₹{(item.unitPrice || item.Product?.price || 0).toFixed(0)} each
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                  className="w-16 border rounded px-2 py-1 text-center"
                />
                <button
                  onClick={() => remove.mutate(item.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6 h-fit">
        <h3 className="text-lg font-semibold mb-4">Order summary</h3>
        <div className="space-y-2 text-sm">
          <SummaryRow label="Subtotal" value={summary.subtotal} />
          <SummaryRow label="Tax (5%)" value={summary.taxTotal} />
          <SummaryRow label="Shipping" value={summary.shippingFee} />
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{Number(summary.payable || 0).toFixed(0)}</span>
        </div>
        <button
          onClick={() => navigate("/checkout")}
          disabled={!items.length}
          className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full font-semibold disabled:opacity-40"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>₹{Number(value || 0).toFixed(0)}</span>
    </div>
  );
}
