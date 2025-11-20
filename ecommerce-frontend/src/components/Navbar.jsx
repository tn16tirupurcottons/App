import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaBars,
  FaShoppingCart,
  FaSearch,
  FaTimes,
  FaArrowRight,
  FaChevronRight,
} from "react-icons/fa";
import MegaMenu from "./MegaMenu";
import { segmentThemes } from "../data/segments";
import { useBrandTheme } from "../context/BrandThemeContext";

const extraLinks = [
  { label: "Home & Living", slug: "home" },
  { label: "Beauty", slug: "beauty" },
  { label: "Studio", slug: "studio" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { theme } = useBrandTheme();
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
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-border shadow-soft"
      style={{ background: theme.headerBackground }}
    >
      <div className="hidden md:flex items-center justify-between px-8 py-2 text-[11px] tracking-[0.3em] text-muted uppercase border-b border-border"
        style={{ background: "var(--surface-color)" }}>
        <span>TN16 · Luxury Cotton Studio</span>
        <span>Worldwide shipping · curated edits</span>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Home Button - Left Side */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:text-primary transition"
            aria-label="Home"
          >
            <span className="hidden sm:inline font-semibold text-dark">Home</span>
            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          
          <button
            className="md:hidden text-dark/80 hover:text-dark"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars size={22} />
          </button>
          <Link
            to="/"
            className="hidden md:flex items-center gap-4"
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
          {/* Mobile: Only show logo */}
          <Link
            to="/"
            className="md:hidden"
          >
            <div className="h-10 w-10 rounded-full border-2 border-primary text-primary font-display text-base tracking-[0.3em] grid place-items-center bg-primary/5">
              TN
            </div>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2 w-full max-w-2xl bg-white/70 border border-border rounded-full px-5 py-2 shadow-soft">
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
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition font-semibold text-xs"
                  >
                    Admin
                  </Link>
                )}
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

      {/* Mobile drawer - Myntra style */}
      {mobileMenuOpen && (
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          segments={segments}
          extraLinks={extraLinks}
          onNavigate={(segmentKey) => handleSegmentNavigate(segmentKey)}
          onLinkClick={() => setMobileMenuOpen(false)}
        />
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

// Myntra-style Mobile Drawer Component
function MobileDrawer({ isOpen, onClose, segments, extraLinks, onNavigate, onLinkClick }) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Hide scrollbars but allow scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      // Add class to body to hide scrollbars but allow scrolling
      document.body.classList.add("menu-open");
      // Hide scrollbar for webkit browsers
      const style = document.createElement("style");
      style.id = "menu-scrollbar-hide";
      style.textContent = `
        body.menu-open {
          overflow-y: scroll !important;
          overflow-x: hidden !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        body.menu-open::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.classList.remove("menu-open");
      const style = document.getElementById("menu-scrollbar-hide");
      if (style) {
        style.remove();
      }
    }
    return () => {
      document.body.classList.remove("menu-open");
      const style = document.getElementById("menu-scrollbar-hide");
      if (style) {
        style.remove();
      }
    };
  }, [isOpen]);

  // Handle swipe to close
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="md:hidden fixed inset-0 z-50"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      {/* Backdrop - allows page scrolling behind */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      
      {/* Drawer - Clean white background */}
      <div
        ref={drawerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`absolute inset-y-0 left-0 w-[85vw] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header - Clean white */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10" style={{ backgroundColor: "#ffffff" }}>
          <h3 className="text-xl font-bold text-dark">Collections</h3>
          <button
            aria-label="Close navigation"
            className="p-2 rounded-full hover:bg-light active:bg-light text-dark transition"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Content - hide scrollbar, clean white */}
        <div 
          className="overflow-y-auto h-[calc(100vh-73px)] pb-24 scrollbar-hide"
          style={{ 
            backgroundColor: "#ffffff",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="px-6 py-4">
            {/* Home Link */}
            <NavLink
              to="/"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center justify-between py-4 border-b border-border ${
                  isActive ? "text-primary" : "text-dark"
                }`
              }
            >
              <span className="font-semibold text-base">Home</span>
              <FaChevronRight className="text-muted" size={14} />
            </NavLink>

            {/* Segments */}
            {segments.map((segment) => (
              <button
                key={segment.key}
                onClick={() => onNavigate(segment.key)}
                className="w-full flex items-center justify-between py-4 border-b border-border text-left hover:bg-light transition active:bg-light"
              >
                <div className="flex-1">
                  <p className="font-semibold text-base text-dark">{segment.label}</p>
                  <p className="text-xs text-muted mt-1">{segment.description}</p>
                </div>
                <FaChevronRight className="text-muted flex-shrink-0 ml-3" size={14} />
              </button>
            ))}

            {/* Extra Links */}
            {extraLinks.map((link) => (
              <NavLink
                key={link.slug}
                to={`/catalog?category=${link.slug}`}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `flex items-center justify-between py-4 border-b border-border ${
                    isActive ? "text-primary" : "text-dark"
                  }`
                }
              >
                <span className="font-semibold text-base">{link.label}</span>
                <FaChevronRight className="text-muted" size={14} />
              </NavLink>
            ))}

            {/* Account Section */}
            <div className="mt-6 pt-6 border-t-2 border-border">
              <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4 font-semibold">
                Account
              </p>
              <NavLink
                to="/wishlist"
                onClick={onLinkClick}
                className="flex items-center justify-between py-3 text-dark hover:bg-light transition active:bg-light"
              >
                <span className="font-medium">Wishlist</span>
                <FaChevronRight className="text-muted" size={14} />
              </NavLink>
              <NavLink
                to="/cart"
                onClick={onLinkClick}
                className="flex items-center justify-between py-3 text-dark hover:bg-light transition active:bg-light"
              >
                <span className="font-medium">Cart</span>
                <FaChevronRight className="text-muted" size={14} />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
