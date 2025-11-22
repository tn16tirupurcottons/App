import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useBrandTheme } from "../context/BrandThemeContext";

export default function Footer() {
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";
  const theme = useBrandTheme();

  return (
    <footer 
      className="mt-16 border-t w-full"
      style={{
        background: theme.footerBackground || "linear-gradient(to bottom, #f5f4f0 0%, #ebe9e3 100%)",
        color: theme.footerTextColor || "#1a1a1a"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid gap-8 sm:gap-10 md:gap-12 md:grid-cols-4 text-sm">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1">
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-serif leading-tight"
                style={{ 
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  color: theme.footerTextColor || "#1a1a1a",
                  fontWeight: 600,
                  letterSpacing: '0.02em'
                }}
              >
                {brand.split(' ').slice(0, 2).join(' ')}
              </h2>
              <h3 
                className="text-xl sm:text-2xl md:text-3xl font-serif leading-tight"
                style={{ 
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  color: theme.footerTextColor || "#1a1a1a",
                  fontWeight: 400,
                  letterSpacing: '0.02em'
                }}
              >
                {brand.split(' ').slice(2).join(' ')}
              </h3>
            </div>
            <p 
              className="text-sm sm:text-base leading-relaxed"
              style={{ 
                color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)",
                fontWeight: 300
              }}
            >
              Curated Tirupur cotton capsules, crafted with slow luxury sensibility
              and precise tailoring.
            </p>
          </div>

          {/* Index Section */}
          <div>
            <p 
              className="text-xs uppercase tracking-[0.4em] mb-5 sm:mb-6 font-semibold"
              style={{ 
                color: theme.footerTextColor || "#1a1a1a",
                letterSpacing: '0.4em'
              }}
            >
              INDEX
            </p>
            <ul className="space-y-3 sm:space-y-3.5">
              <li>
                <Link 
                  to="/about" 
                  className="block text-sm sm:text-base transition-colors duration-200 hover:opacity-70"
                  style={{ 
                    color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)"
                  }}
                >
                  About the studio
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="block text-sm sm:text-base transition-colors duration-200 hover:opacity-70"
                  style={{ 
                    color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)"
                  }}
                >
                  Shipping & returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/membership" 
                  className="block text-sm sm:text-base transition-colors duration-200 hover:opacity-70"
                  style={{ 
                    color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)"
                  }}
                >
                  Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p 
              className="text-xs uppercase tracking-[0.4em] mb-5 sm:mb-6 font-semibold"
              style={{ 
                color: theme.footerTextColor || "#1a1a1a",
                letterSpacing: '0.4em'
              }}
            >
              CONCIERGE
            </p>
            <div className="space-y-2">
              <a 
                href="mailto:tn16tirupurcotton@gmail.com"
                className="block text-sm sm:text-base transition-colors duration-200 hover:opacity-70"
                style={{ 
                  color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)"
                }}
              >
                tn16tirupurcotton@gmail.com
              </a>
              <a 
                href="tel:+919597698343"
                className="block text-sm sm:text-base transition-colors duration-200 hover:opacity-70"
                style={{ 
                  color: theme.footerTextColor ? `${theme.footerTextColor}DD` : "rgba(26, 26, 26, 0.85)"
                }}
              >
                +91 95976 98343
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <p 
              className="text-xs uppercase tracking-[0.4em] mb-5 sm:mb-6 font-semibold"
              style={{ 
                color: theme.footerTextColor || "#1a1a1a",
                letterSpacing: '0.4em'
              }}
            >
              CONNECT
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {[
                { 
                  icon: FaFacebookF, 
                  link: "https://www.facebook.com/",
                  label: "Facebook",
                  brandColor: "#1877F2"
                },
                { 
                  icon: FaInstagram, 
                  link: "https://www.instagram.com/",
                  label: "Instagram",
                  brandColor: "#E4405F"
                },
                { 
                  icon: FaWhatsapp, 
                  link: "https://wa.me/919597698343",
                  label: "WhatsApp",
                  brandColor: "#25D366"
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border transition-all duration-300 hover:scale-110 active:scale-95"
                  style={{ 
                    borderColor: theme.footerTextColor ? `${theme.footerTextColor}30` : "rgba(26, 26, 26, 0.2)",
                    backgroundColor: "transparent"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.brandColor;
                    e.currentTarget.style.backgroundColor = `${item.brandColor}10`;
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) icon.style.color = item.brandColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.footerTextColor ? `${theme.footerTextColor}30` : "rgba(26, 26, 26, 0.2)";
                    e.currentTarget.style.backgroundColor = "transparent";
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) icon.style.color = theme.footerTextColor || "#1a1a1a";
                  }}
                >
                  <item.icon 
                    size={18} 
                    className="sm:w-5 sm:h-5"
                    style={{ 
                      color: theme.footerTextColor || "#1a1a1a",
                      transition: "color 0.3s ease"
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div 
        className="border-t py-4 sm:py-5 text-center"
        style={{ 
          borderColor: theme.footerTextColor ? `${theme.footerTextColor}15` : "rgba(26, 26, 26, 0.1)"
        }}
      >
        <p 
          className="text-xs sm:text-sm"
          style={{ 
            color: theme.footerTextColor ? `${theme.footerTextColor}AA` : "rgba(26, 26, 26, 0.7)",
            fontWeight: 300,
            letterSpacing: '0.05em'
          }}
        >
          © {new Date().getFullYear()} {brand} · All rights reserved
        </p>
      </div>
    </footer>
  );
}
