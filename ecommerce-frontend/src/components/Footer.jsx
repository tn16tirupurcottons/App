import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BRAND_NAME } from "@/config/brand";

const BRAND_HIGHLIGHTS = [
  "Premium Cotton",
  "Clean Silhouettes",
  "Conscious Production",
];

export default function Footer() {
  const brandWordmark = BRAND_NAME.replace(/™|®/g, "");

  const social = [
    { icon: FaInstagram, href: "https://www.instagram.com/", label: "Instagram" },
    { icon: FaFacebookF, href: "https://www.facebook.com/", label: "Facebook" },
    { icon: FaWhatsapp, href: "https://wa.me/919597698343", label: "WhatsApp" },
  ];

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-neutral-50 text-neutral-600">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        <div className="grid gap-12 sm:gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand story — premium editorial block */}
          <div className="lg:col-span-1 max-w-md">
            <p className="font-display text-3xl sm:text-[2rem] font-bold text-neutral-900 tracking-[0.18em] uppercase leading-tight">
              {brandWordmark}
            </p>
            <p className="mt-3 text-[11px] sm:text-xs font-medium uppercase tracking-[0.28em] text-neutral-600">
              Designed for everyday luxury.
            </p>

            <div className="mt-8 space-y-4 text-sm leading-[1.75] text-[#555555]">
              <p>
                {brandWordmark} is a modern cotton studio built on clean silhouettes, refined essentials,
                and mindful craftsmanship.
              </p>
              <p>
                We focus on timeless design, premium fabrics, and everyday comfort—crafted for those who
                value simplicity with purpose.
              </p>
            </div>

            <ul
              className="mt-8 pt-8 border-t border-neutral-200/90 space-y-3"
              aria-label="Brand pillars"
            >
              {BRAND_HIGHLIGHTS.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900"
                >
                  <span className="text-neutral-400 font-normal select-none" aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-4">Explore</p>
            <ul className="space-y-3 text-sm text-[#555555]">
              <li>
                <Link
                  to="/about"
                  className="hover:text-neutral-900 transition duration-200 ease-in-out"
                >
                  Studio
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-neutral-900 transition duration-200 ease-in-out"
                >
                  Shipping & returns
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="hover:text-neutral-900 transition duration-200 ease-in-out"
                >
                  Membership
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-4">Contact</p>
            <a
              href="mailto:tn16tirupurcotton@gmail.com"
              className="text-sm text-[#555555] block hover:text-neutral-900 transition ease-in-out break-words"
            >
              tn16tirupurcotton@gmail.com
            </a>
            <a
              href="tel:+919597698343"
              className="text-sm text-[#555555] block mt-3 hover:text-neutral-900 transition ease-in-out"
            >
              +91 95976 98343
            </a>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500 mb-4">Social</p>
            <div className="flex gap-3">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 flex items-center justify-center border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition duration-200 ease-in-out"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-6 text-center text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-500 uppercase">
        © {new Date().getFullYear()} {brandWordmark} · All rights reserved
      </div>
    </footer>
  );
}
