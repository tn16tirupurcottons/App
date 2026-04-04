import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";

export default function Editions() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["editions-products"],
    queryFn: async () => {
      try {
        // Fetch limited edition products - you can add a special tag or category
        const res = await axiosClient.get("/products?limit=20&sort=newest");
        return res.data;
      } catch (error) {
        console.error("Error fetching editions:", error);
        return { items: [] };
      }
    },
  });

  const products = productsData?.items || [];

  return (
    <div className="w-full min-h-screen">
      {/* Hero Banner */}
      <section className="w-full mb-8 sm:mb-12">
        <BannerCarousel page="editions" position="hero" />
      </section>

      {/* Header Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6">
            Limited Editions
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Discover our exclusive, limited-run collections crafted with exceptional attention to detail. 
            Each piece is a testament to slow luxury and precise tailoring.
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg font-semibold text-muted">Loading editions...</div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted mb-4">No editions available at the moment.</p>
            <p className="text-sm text-muted">Check back soon for new limited collections.</p>
          </div>
        )}
      </section>

      {/* Additional Content Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-4 sm:mb-6">
            What Makes Our Editions Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Exclusive Designs</h3>
              <p className="text-sm sm:text-base text-muted">
                Each edition features unique designs available only for a limited time.
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Premium Quality</h3>
              <p className="text-sm sm:text-base text-muted">
                Crafted with the finest Tirupur cotton and meticulous attention to detail.
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Limited Availability</h3>
              <p className="text-sm sm:text-base text-muted">
                Once sold out, these pieces won't be restocked, making them truly special.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

