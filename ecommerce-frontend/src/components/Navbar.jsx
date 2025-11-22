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
import SearchBar from "./SearchBar";
import { segmentThemes } from "../data/segments";
import { useBrandTheme } from "../context/BrandThemeContext";

const extraLinks = [
  { label: "Home & Living", slug: "home" },
  { label: "Beauty", slug: "beauty" },
  { label: "Studio", slug: "studio" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout: logoutContext } = useContext(AuthContext);
  const { theme } = useBrandTheme();
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const segments = Object.values(segmentThemes);

  // Handle scroll to show/hide header
  useEffect(() => {
    let ticking = false;
    let lastKnownScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = currentScrollY - lastKnownScrollY;
          
          // Always show and keep header visible when at the very top
          if (currentScrollY <= 10) {
            setIsHeaderVisible(true);
          } 
          // Show header immediately on ANY upward scroll
          else if (scrollDifference < 0) {
            // Any upward scroll movement shows the header immediately
            setIsHeaderVisible(true);
          } 
          // Hide header when scrolling down (only after threshold)
          else if (scrollDifference > 0 && currentScrollY > 100) {
            // Hide if scrolling down and past 100px from top
            setIsHeaderVisible(false);
          }
          // For zero movement or small down movements, maintain current state
          
          lastKnownScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initialize scroll position
    lastKnownScrollY = window.scrollY;
    
    // Set initial visibility - always show at top
    if (window.scrollY <= 10) {
      setIsHeaderVisible(true);
    } else {
      setIsHeaderVisible(false);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Logout handler with redirect
  const logout = () => {
    logoutContext();
    navigate("/");
  };

  const handleSegmentNavigate = (segmentKey) => {
    navigate(`/catalog?segment=${segmentKey}`);
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-200/50 shadow-lg transition-transform duration-200 ease-in-out ${
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{
        // Use theme-controlled header background, fallback to luxury light gradient
        background:
          theme.headerBackground ||
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #f1f3f5 100%)",
        borderColor: "rgba(0, 0, 0, 0.1)",
      }}
    >
      <div 
        className="hidden md:flex items-center justify-between px-8 py-2 text-[11px] tracking-[0.3em] uppercase border-b"
        style={{ 
          background: "rgba(0, 0, 0, 0.02)",
          borderColor: "rgba(0, 0, 0, 0.1)",
          color: theme.headerTextColor || "#0a0a0a"
        }}
      >
        <span>{theme.headerPrimaryText || "TN16 · Luxury Cotton Studio"}</span>
        <span>{theme.headerSecondaryText || "Worldwide shipping · curated edits"}</span>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          <button
            className="md:hidden hover:opacity-80 transition"
            style={{ color: theme.headerTextColor || "#0a0a0a" }}
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FaBars size={22} />
          </button>
          <Link
            to="/"
            className="hidden md:flex items-center gap-4"
          >
            {theme.logo ? (
              <img 
                src={theme.logo} 
                alt={brand}
                className="h-12 w-12 object-contain"
                style={{ maxWidth: '48px', maxHeight: '48px' }}
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.style.display = 'grid';
                }}
              />
            ) : null}
            <div 
              className={`logo-fallback h-12 w-12 rounded-full border-2 border-white/30 font-display text-lg tracking-[0.3em] grid place-items-center bg-white/10 backdrop-blur-sm ${theme.logo ? 'hidden' : ''}`}
              style={{ color: theme.headerTextColor || "#0a0a0a" }}
            >
              TN
            </div>
            <div className="text-left">
              <p 
                className="font-semibold text-lg leading-tight"
                style={{ color: theme.headerTextColor || "#0a0a0a" }}
              >
                {brand}
              </p>
              <p 
                className="pill text-[10px]"
                style={{ color: theme.headerTextColor ? `${theme.headerTextColor}CC` : "rgba(10,10,10,0.7)" }}
              >
                Tirupur · Established MMXXV
              </p>
            </div>
          </Link>
          {/* Mobile: Only show logo */}
          <Link
            to="/"
            className="md:hidden"
          >
            {theme.logo ? (
              <img 
                src={theme.logo} 
                alt={brand}
                className="h-10 w-10 object-contain"
                style={{ maxWidth: '40px', maxHeight: '40px' }}
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement?.querySelector('.logo-fallback-mobile');
                  if (fallback) fallback.style.display = 'grid';
                }}
              />
            ) : null}
            <div 
              className={`logo-fallback-mobile h-10 w-10 rounded-full border-2 border-white/30 font-display text-base tracking-[0.3em] grid place-items-center bg-white/10 backdrop-blur-sm ${theme.logo ? 'hidden' : ''}`}
              style={{ color: theme.headerTextColor || "#0a0a0a" }}
            >
              TN
            </div>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <SearchBar
              placeholder="Search pieces, collections, artisans"
              className="w-full max-w-2xl"
              style={{
                color: theme.headerTextColor || "#0a0a0a",
                borderColor: theme.headerTextColor ? `${theme.headerTextColor}20` : "rgba(10,10,10,0.2)",
              }}
            />
          </div>

          <div 
            className="ml-auto flex items-center gap-3 text-sm font-medium"
            style={{ color: theme.headerTextColor || "#0a0a0a" }}
          >
            <Link
              to="/cart"
              aria-label="View cart"
              className="hidden sm:flex items-center gap-2 hover:opacity-80 transition"
              style={{ color: theme.headerTextColor || "#0a0a0a" }}
            >
              <FaShoppingCart size={16} /> Cart
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-full border transition font-semibold text-xs backdrop-blur-sm"
                    style={{ 
                      backgroundColor: theme.headerTextColor ? `${theme.headerTextColor}10` : "rgba(10,10,10,0.1)",
                      color: theme.headerTextColor || "#0a0a0a",
                      borderColor: theme.headerTextColor ? `${theme.headerTextColor}30` : "rgba(10,10,10,0.3)"
                    }}
                  >
                    Admin
                  </Link>
                )}
                <span className="hidden sm:block" style={{ color: theme.headerTextColor ? `${theme.headerTextColor}CC` : "rgba(10,10,10,0.8)" }}>
                  {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full border transition backdrop-blur-sm"
                  style={{ 
                    borderColor: theme.headerTextColor ? `${theme.headerTextColor}30` : "rgba(10,10,10,0.3)",
                    color: theme.headerTextColor || "#0a0a0a",
                    backgroundColor: "transparent"
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="hover:opacity-80 transition"
                  style={{ color: theme.headerTextColor || "#0a0a0a" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-white text-gray-900 hover:bg-white/90 transition font-semibold shadow-lg"
                >
                  Join
                </Link>
              </div>
            )}
            <Link
              to="/cart"
              aria-label="View cart"
              className="md:hidden flex items-center hover:opacity-80 transition relative"
              style={{ color: theme.headerTextColor || "#0a0a0a" }}
            >
              <FaShoppingCart size={20} />
            </Link>
            <button
              className="md:hidden hover:opacity-80 transition ml-2"
              style={{ color: theme.headerTextColor || "#0a0a0a" }}
              aria-label="Open search panel"
              onClick={() => setMobileSearchOpen(true)}
            >
              <FaSearch size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="border-t backdrop-blur-md hidden md:block"
        style={{
          borderColor: theme.headerTextColor ? `${theme.headerTextColor}10` : "rgba(10,10,10,0.1)",
          backgroundColor: theme.headerTextColor ? `${theme.headerTextColor}05` : "rgba(10,10,10,0.05)"
        }}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div 
          className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-5 py-3 text-sm font-semibold"
          style={{ color: theme.headerTextColor ? `${theme.headerTextColor}CC` : "rgba(10,10,10,0.8)" }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `pb-2 border-b-2 transition ${
                isActive ? "" : "border-transparent hover:opacity-80"
              }`
            }
            style={({ isActive }) => ({
              color: theme.headerTextColor || "#0a0a0a",
              borderBottomColor: isActive ? (theme.headerTextColor || "#0a0a0a") : "transparent"
            })}
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
          user={user}
          logout={logout}
        />
      )}

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 px-6 py-7">
          <SearchBar
            placeholder="Search TN16 studio"
            className="w-full"
            style={{ color: "#0a0a0a" }}
            onClose={() => setMobileSearchOpen(false)}
            showCloseButton={true}
            autoFocus={true}
          />
        </div>
      )}
    </header>
  );
}

// Myntra-style Mobile Drawer Component
function MobileDrawer({ isOpen, onClose, segments, extraLinks, onNavigate, onLinkClick, user, logout }) {
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
        className={`absolute inset-y-0 left-0 w-[75vw] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
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

            {/* Login/Join Section - at the bottom (Mobile only - always show Login/Join) */}
            <div className="mt-6 pt-6 border-t-2 border-border">
              <Link
                to="/login"
                onClick={onLinkClick}
                className="flex items-center justify-between py-4 text-dark hover:bg-light transition active:bg-light"
              >
                <span className="font-semibold text-base">Login</span>
                <FaChevronRight className="text-muted" size={14} />
              </Link>
              <Link
                to="/register"
                onClick={onLinkClick}
                className="flex items-center justify-between py-4 text-dark hover:bg-light transition active:bg-light"
              >
                <span className="font-semibold text-base">Join</span>
                <FaChevronRight className="text-muted" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
