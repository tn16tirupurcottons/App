import React from "react";

export default function Wishlist() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
      <p className="text-gray-600">
        Save your favourite TN16 fits and we’ll keep them ready for checkout.
        This section is getting a full upgrade soon—stay tuned!
      </p>
      <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-pink-600">
          No items yet. Tap the heart icon on any product to add it here.
        </p>
      </div>
    </div>
  );
}

