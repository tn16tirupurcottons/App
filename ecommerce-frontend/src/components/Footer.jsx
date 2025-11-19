import React from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";

  return (
    <footer className="mt-16 border-t border-border bg-light text-dark">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4 text-sm">
        <div className="space-y-4">
          <p className="text-xl font-display tracking-[0.3em] text-primary">{brand}</p>
          <p className="text-muted leading-relaxed">
            Curated Tirupur cotton capsules, crafted with slow luxury sensibility
            and precise tailoring.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Index
          </p>
          <ul className="space-y-2 text-dark/70">
            <li className="hover:text-primary cursor-pointer">About the studio</li>
            <li className="hover:text-primary cursor-pointer">Shipping & returns</li>
            <li className="hover:text-primary cursor-pointer">Membership</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Concierge
          </p>
          <p className="text-dark/70">support@tn16tirupurcotton.com</p>
          <p className="text-dark/70 mt-1">+91 95976 98343</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Connect
          </p>
          <div className="flex space-x-4 text-muted">
            {[FaFacebookF, FaInstagram, FaWhatsapp].map((Icon, idx) => (
              <a
                key={idx}
                href="#!"
                className="p-3 border border-border rounded-full hover:border-primary hover:text-primary transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand} · All rights reserved
      </div>
    </footer>
  );
}
