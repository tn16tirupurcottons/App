import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState("");

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/products/${id}`);
      return res.data;
    },
  });

  const gallery = useMemo(() => {
    const images = product?.gallery?.length
      ? product.gallery
      : [product?.thumbnail || product?.image];
    return images.filter(Boolean);
  }, [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setActiveImage(0);
  }, [gallery.length]);

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const addToCart = useMutation(
    async () =>
      axiosClient.post("/cart", {
        productId: product.id,
        quantity,
        selectedSize,
        selectedColor,
      }),
    {
      onSuccess: () => {
        setFeedback("Added to bag!");
        setTimeout(() => setFeedback(""), 3000);
      },
      onError: (err) => {
        setFeedback(
          err.response?.data?.message || "Unable to add to bag right now."
        );
      },
    }
  );

  if (isLoading)
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  if (error || !product)
    return (
      <div className="text-center mt-10 text-red-600">
        Product not found.
      </div>
    );

  const finalPrice =
    Number(product.price || 0) - Number(product.discount || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
          <img
            src={gallery[activeImage]}
            alt={product.name}
            className="w-full h-[480px] object-cover"
          />
        </div>
        <div className="flex gap-3 mt-4">
          {gallery.map((img, idx) => (
            <button
              key={img}
              onClick={() => setActiveImage(idx)}
              className={`h-20 w-20 rounded-2xl overflow-hidden border ${
                activeImage === idx
                  ? "border-pink-500"
                  : "border-transparent opacity-60"
              }`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-pink-500 font-semibold">
          {product.Category?.name || "TN16 Collection"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl font-bold text-gray-900">
            ₹{finalPrice.toFixed(0)}
          </span>
          {product.discount > 0 && (
            <span className="text-gray-400 line-through">
              ₹{Number(product.price).toFixed(0)}
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-6 leading-relaxed">
          {product.description}
        </p>

        {product.sizes?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedSize === size
                      ? "bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedColor === color
                      ? "bg-pink-600 text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 border rounded-full px-4 py-2 text-center"
          />
        </div>

        {feedback && (
          <div className="mt-4 text-sm text-pink-600 font-semibold">
            {feedback}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => addToCart.mutate()}
            disabled={addToCart.isLoading}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50"
          >
            {addToCart.isLoading ? "Adding..." : "Add to Bag"}
          </button>
          <button
            onClick={() =>
              addToCart.mutate(undefined, {
                onSuccess: () => navigate("/checkout"),
              })
            }
            disabled={addToCart.isLoading}
            className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded-full font-semibold disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
