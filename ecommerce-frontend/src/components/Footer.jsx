import React from "react";

export default function Footer() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";
  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="text-lg font-bold text-white">{brand}</p>
          <p className="text-gray-400 mt-3">
            Elevated cotton fits straight from Tirupur’s looms, curated with a
            Myntra/Zara inspired experience for modern closets.
          </p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Quick Links</p>
          <ul className="space-y-2 text-gray-400">
            <li>About TN16</li>
            <li>Shipping & Returns</li>
            <li>TN16 Insider Club</li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Need Help?</p>
          <p className="text-gray-400">hello@tn16cotton.com</p>
          <p className="text-gray-400 mt-1">+91 98765 43210</p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {brand} · Crafted with love in Tirupur
      </div>
    </footer>
  );
}
