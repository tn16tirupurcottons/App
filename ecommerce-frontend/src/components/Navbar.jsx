import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaBars, FaShoppingCart, FaSearch, FaTimes, FaChevronRight } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { useBrandTheme } from "../context/BrandThemeContext";

const centerCategories = [
  { label: "Men", segment: "men" },
  { label: "Women", segment: "women" },
  { label: "Kids", segment: "kids" },
];

const drawerLinks = [
  ...centerCategories,
  { label: "Dress & Fashion", segment: "genz" },
  { label: "Shop all", href: "/catalog" },
  { label: "Editions", href: "/editions" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const segmentParam = new URLSearchParams(location.search).get("segment");
  const { user, logout: logoutContext } = useContext(AuthContext);
  const { theme } = useBrandTheme();
  const brand = import.meta.env.VITE_BRAND_NAME || "TNEXT";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const logout = () => {
    logoutContext();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E5E7EB] bg-white backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 md:h-[4.25rem] grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 text-neutral-800 hover:text-neutral-600 transition ease-in-out"
            aria-label="Open menu"
            onClick={() => {
              setMobileMenuOpen(true);
              setMobileSearchOpen(false);
            }}
          >
            <FaBars size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 min-w-0 group">
            {theme.logo ? (
              <img
                src={theme.logo}
                alt={brand}
                className="h-9 w-9 object-contain shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <span className="font-display text-2xl sm:text-[1.75rem] font-bold text-[#000000] tracking-[0.12em] uppercase truncate group-hover:text-neutral-800 transition ease-in-out">
              {brand.replace(/™|®/g, "").slice(0, 8)}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-12" aria-label="Categories">
          {centerCategories.map(({ label, segment }) => {
            const active = location.pathname === "/catalog" && segmentParam === segment;
            return (
              <Link
                key={segment}
                to={`/catalog?segment=${segment}`}
                className={`text-xs font-semibold uppercase tracking-[0.2em] transition duration-200 ease-in-out border-b-2 pb-1 ${
                  active
                    ? "text-[#000000] border-[#000000]"
                    : "text-[#555555] border-transparent hover:text-[#000000] hover:border-[#E5E7EB]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <div className="hidden lg:block w-full max-w-[220px] xl:max-w-xs">
            <SearchBar
              placeholder="Search products"
              className="w-full"
              variant="light"
            />
          </div>
          <button
            type="button"
            className="lg:hidden p-2 text-neutral-800 hover:text-neutral-600 transition ease-in-out"
            aria-label="Search"
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              setMobileMenuOpen(false);
            }}
          >
            <FaSearch size={18} />
          </button>
          <Link
            to="/cart"
            className="p-2 text-[#000000] hover:text-neutral-700 transition ease-in-out"
            aria-label="Cart"
          >
            <FaShoppingCart size={18} />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-700 border border-neutral-300 rounded-full hover:border-neutral-900 hover:bg-neutral-50 transition ease-in-out"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-xs text-[#555555] max-w-[4rem] truncate hidden xl:inline">
                  {user.name?.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white bg-neutral-900 border border-neutral-900 rounded-full hover:bg-neutral-800 transition ease-in-out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[10px] font-semibold uppercase tracking-widest text-[#000000] hover:text-neutral-800 transition ease-in-out px-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition ease-in-out"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-3">
          <SearchBar placeholder="Search catalog…" className="w-full" variant="light" showCloseButton autoFocus onClose={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {mobileMenuOpen && (
        <MobileDrawer onClose={() => setMobileMenuOpen(false)} user={user} logout={logout} />
      )}
    </header>
  );
}

function MobileDrawer({ onClose, user, logout }) {
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const go = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 z-[60]" ref={overlayRef}>
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-label="Close menu" onClick={onClose} />
      <div className="absolute top-0 left-0 h-full w-[min(88vw,380px)] bg-white border-r border-neutral-200 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <span className="font-display text-xl uppercase tracking-[0.15em] text-neutral-900">Menu</span>
          <button type="button" className="p-2 text-neutral-500 hover:text-neutral-900" aria-label="Close" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {drawerLinks.map((item) => {
            if (item.href) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.href)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left text-sm font-semibold uppercase tracking-widest text-neutral-800 border-b border-neutral-100 hover:bg-neutral-50 transition ease-in-out"
                >
                  {item.label}
                  <FaChevronRight size={12} className="text-neutral-400" />
                </button>
              );
            }
            return (
              <button
                key={item.segment}
                type="button"
                onClick={() => go(`/catalog?segment=${item.segment}`)}
                className="w-full flex items-center justify-between px-4 py-4 text-left text-sm font-semibold uppercase tracking-widest text-neutral-800 border-b border-neutral-100 hover:bg-neutral-50 transition ease-in-out"
              >
                {item.label}
                <FaChevronRight size={12} className="text-neutral-400" />
              </button>
            );
          })}
          <div className="mt-6 px-4 space-y-1 border-t border-neutral-200 pt-6">
            <button type="button" onClick={() => go("/wishlist")} className="block w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900">
              Wishlist
            </button>
            {!user ? (
              <>
                <button type="button" onClick={() => go("/login")} className="block w-full text-left py-3 text-sm text-[#000000] hover:text-neutral-800">
                  Login
                </button>
                <button type="button" onClick={() => go("/register")} className="block w-full text-left py-3 text-sm text-[#000000] font-semibold">
                  Join
                </button>
              </>
            ) : (
              <>
                {user.role === "admin" && (
                  <button type="button" onClick={() => go("/admin")} className="block w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900">
                    Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="block w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
