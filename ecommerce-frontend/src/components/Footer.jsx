import React from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";

  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        {/* Column 1: Brand */}
        <div>
          <p className="text-lg font-bold text-white">{brand}</p>
          <p className="text-gray-400 mt-3">
            Premium Tirupur cotton, designed for modern closets. Comfort meets
            style in every stitch.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <p className="text-white font-semibold mb-3">Quick Links</p>
          <ul className="space-y-2 text-gray-400">
            <li>About TN16</li>
            <li>Shipping & Returns</li>
            <li>TN16 Insider Club</li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <p className="text-white font-semibold mb-3">Need Help?</p>
          <p className="text-gray-400">support@tn16tirupurcotton.com</p>
          <p className="text-gray-400 mt-1">+91 95976 98343</p>
        </div>

        {/* Column 4: Social Media */}
        <div>
          <p className="text-white font-semibold mb-3">Follow Us</p>
          <div className="flex space-x-4 mt-2 text-gray-400">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://wa.me/919597698343"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              <FaWhatsapp size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {brand} · Crafted with care in Tirupur
      </div>
    </footer>
  );
}
