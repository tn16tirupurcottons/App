import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaBars,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import MegaMenu from "./MegaMenu";
import { segmentThemes } from "../data/segments";

const extraLinks = [
  { label: "Home & Living", slug: "home" },
  { label: "Beauty", slug: "beauty" },
  { label: "Studio", slug: "studio" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const segments = Object.values(segmentThemes);

  const handleSegmentNavigate = (segmentKey) => {
    navigate(`/catalog?segment=${segmentKey}`);
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-3xl border-b border-border shadow-soft">
      <div className="hidden md:flex items-center justify-between px-8 py-2 text-[11px] tracking-[0.3em] text-muted uppercase border-b border-border bg-light">
        <span>TN16 · Luxury Cotton Studio</span>
        <span>Worldwide shipping · curated edits</span>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          <button
            className="md:hidden text-dark/80 hover:text-dark"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars size={22} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 flex-1 md:flex-none md:gap-4"
          >
            <div className="h-12 w-12 rounded-full border-2 border-primary text-primary font-display text-lg tracking-[0.3em] grid place-items-center bg-primary/5">
              TN
            </div>
            <div className="text-left">
              <p className="text-dark font-semibold text-lg leading-tight">
                {brand}
              </p>
              <p className="pill text-[10px] text-muted">
                Tirupur · Established MMXXV
              </p>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 items-center gap-2 max-w-xl bg-light border border-border rounded-full px-5 py-2">
            <FaSearch className="text-muted" />
            <input
              type="text"
              placeholder="Search pieces, collections, artisans"
              className="flex-1 bg-transparent text-sm text-dark focus:outline-none placeholder:text-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(
                    `/catalog?query=${encodeURIComponent(e.target.value)}`
                  );
                }
              }}
            />
          </div>

          <div className="ml-auto flex items-center gap-3 text-sm font-medium text-dark/80">
            <Link
              to="/cart"
              aria-label="View cart"
              className="hidden sm:flex items-center gap-2 hover:text-primary"
            >
              <FaShoppingCart size={16} /> Cart
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-muted">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hover:text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition"
                >
                  Join
                </Link>
              </div>
            )}
            <button
              className="md:hidden text-dark/80 hover:text-dark"
              aria-label="Open search panel"
              onClick={() => setMobileSearchOpen(true)}
            >
              <FaSearch size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="border-t border-border bg-light hidden md:block"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-5 py-3 text-sm font-semibold text-dark/70">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `pb-2 border-b-2 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent hover:border-primary/40 hover:text-primary"
              }`
            }
          >
            Home
          </NavLink>
          {segments.map((segment) => (
            <button
              key={segment.key}
              onMouseEnter={() => setActiveMenu(segment.key)}
              onFocus={() => setActiveMenu(segment.key)}
              onClick={() => handleSegmentNavigate(segment.key)}
              className={`relative pb-2 border-b-2 transition ${
                activeMenu === segment.key
                  ? "text-primary border-primary"
                  : "border-transparent hover:border-primary/40 hover:text-primary"
              }`}
            >
              {segment.label}
            </button>
          ))}
          {extraLinks.map((link) => (
            <NavLink
              key={link.slug}
              to={`/catalog?category=${link.slug}`}
              className={({ isActive }) =>
                `pb-2 border-b-2 ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent hover:border-primary/40 hover:text-primary"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="ml-auto flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-muted">
            <span className="flex items-center gap-2">
              Editions <FaArrowRight size={10} />
            </span>
          </div>
        </div>
        <MegaMenu segment={segmentThemes[activeMenu]} />
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur z-50">
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-border p-6 overflow-y-auto shadow-large">
            <div className="flex items-center justify-between mb-8 text-dark">
              <h3 className="text-lg font-semibold">Collections</h3>
              <button
                aria-label="Close navigation"
                className="text-muted hover:text-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <ul className="space-y-5 text-dark">
              {segments.map((segment) => (
                <li key={segment.key}>
                  <button
                    className="text-left w-full"
                    onClick={() => handleSegmentNavigate(segment.key)}
                  >
                    <p className="text-base font-semibold">{segment.label}</p>
                    <p className="text-xs text-muted">{segment.description}</p>
                  </button>
                </li>
              ))}
              {extraLinks.map((link) => (
                <li key={link.slug}>
                  <NavLink
                    to={`/catalog?category=${link.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-dark/80 hover:text-primary"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-semibold text-dark/80 hover:text-primary"
                >
                  Admin
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 px-6 py-7">
          <div className="flex items-center justify-between mb-6 text-dark">
            <p className="text-sm uppercase tracking-[0.4em] text-muted">
              Search
            </p>
            <button
              aria-label="Close search"
              className="text-muted hover:text-dark"
              onClick={() => setMobileSearchOpen(false)}
            >
              <FaTimes size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3 border-2 border-border rounded-full px-5 py-3 focus-within:border-primary">
            <FaSearch className="text-muted" />
            <input
              autoFocus
              type="text"
              placeholder="Search TN16 studio"
              className="flex-1 bg-transparent text-dark focus:outline-none placeholder:text-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(`/catalog?query=${encodeURIComponent(e.target.value)}`);
                  setMobileSearchOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
