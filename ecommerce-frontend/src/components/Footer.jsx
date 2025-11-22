import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useBrandTheme } from "../context/BrandThemeContext";

export default function Footer() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";
  const theme = useBrandTheme();

  return (
    <footer 
      className="mt-16 border-t border-border w-full"
      style={{
        background: theme.footerBackground || "#f8fafc",
        color: theme.footerTextColor || "#111827"
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4 text-sm">

        {/* Brand Section */}
        <div className="space-y-4">
          <p className="text-xl font-display tracking-[0.3em] text-primary">
            {brand}
          </p>
          <p className="text-muted leading-relaxed">
            Curated Tirupur cotton capsules, crafted with slow luxury sensibility
            and precise tailoring.
          </p>
        </div>

        {/* Index Section */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Index
          </p>

          <ul className="space-y-2 text-dark/70">
            <li>
              <Link to="/about" className="hover:text-primary transition">
                About the studio
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-primary transition">
                Shipping & returns
              </Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-primary transition">
                Membership
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Concierge
          </p>
          <p className="text-dark/70">tn16tirupurcotton@gmail.com</p>
          <p className="text-dark/70 mt-1">+91 95976 98343</p>
        </div>

        {/* Social Links */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted mb-4">
            Connect
          </p>

          <div className="flex space-x-4 text-muted">
            {[
              { icon: FaFacebookF, link: "https://www.facebook.com/" },
              { icon: FaInstagram, link: "https://www.instagram.com/" },
              { icon: FaWhatsapp, link: "https://wa.me/9597698343" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-border rounded-full hover:border-primary hover:text-primary transition"
              >
                <item.icon size={16} />
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Strip */}
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand} · All rights reserved
      </div>
    </footer>
  );
}
