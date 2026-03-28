import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";
import SearchBar from "./SearchBar";
import SideMenu from "./SideMenu";
import { AuthContext } from "../context/AuthContext";
import { useBrandTheme } from "../context/BrandThemeContext";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: logoutContext } = useContext(AuthContext);
  const { theme } = useBrandTheme();
  const brand = import.meta.env.VITE_BRAND_NAME || "TNEXT";
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    logoutContext();
    navigate("/");
    setMenuOpen(false);
  };

  const accountHref = user ? "/membership" : "/login";
  const accountLabel = user ? "Account" : "Login";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/90 bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={logout} />

      {/* Mobile: menu + brand + actions, then full-width search */}
      <div className="md:hidden">
        <div className="max-w-[1600px] mx-auto flex h-14 items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <FaBars size={20} />
          </button>
          <Link to="/" className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start">
            {theme.logo ? (
              <img
                src={theme.logo}
                alt={brand}
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <span className="font-display truncate text-lg font-bold uppercase tracking-[0.12em] text-neutral-900">
              {brand.replace(/™|®/g, "").slice(0, 10)}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <Link
              to="/wishlist"
              className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label="Wishlist"
            >
              <FaHeart size={18} />
            </Link>
            <Link
              to={accountHref}
              className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label={accountLabel}
            >
              <FaUser size={18} />
            </Link>
          </div>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <SearchBar placeholder="Search products" className="w-full" variant="light" />
        </div>
      </div>

      {/* Tablet: menu, logo, search, icons (no header cart) */}
      <div className="hidden md:flex lg:hidden max-w-[1600px] mx-auto h-[4.25rem] items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <FaBars size={20} />
        </button>
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {theme.logo ? (
            <img
              src={theme.logo}
              alt={brand}
              className="h-9 w-9 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
          <span className="font-display hidden sm:inline text-base font-bold uppercase tracking-[0.12em] text-neutral-900">
            {brand.replace(/™|®/g, "").slice(0, 8)}
          </span>
        </Link>
        <div className="min-w-0 flex-1 max-w-xl mx-auto">
          <SearchBar placeholder="Search products" className="w-full" variant="light" />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/wishlist"
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="Wishlist"
          >
            <FaHeart size={18} />
          </Link>
          <Link
            to={accountHref}
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label={accountLabel}
          >
            <FaUser size={18} />
          </Link>
        </div>
      </div>

      {/* Desktop: logo | centered search | profile, wishlist, cart */}
      <div className="hidden lg:grid max-w-[1600px] mx-auto h-[4.25rem] grid-cols-[1fr_minmax(0,36rem)_1fr] items-center gap-6 px-6 xl:px-8">
        <Link to="/" className="flex items-center gap-3 min-w-0 justify-self-start">
          {theme.logo ? (
            <img
              src={theme.logo}
              alt={brand}
              className="h-10 w-10 object-contain shrink-0"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
          <span className="font-display text-xl font-bold uppercase tracking-[0.14em] text-neutral-900 truncate">
            {brand.replace(/™|®/g, "").slice(0, 12)}
          </span>
        </Link>

        <div className="justify-self-center w-full max-w-xl">
          <SearchBar placeholder="Search products" className="w-full" variant="light" />
        </div>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden xl:inline-flex px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-700 border border-neutral-300 rounded-full hover:border-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-800 hover:text-neutral-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold uppercase tracking-widest bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors"
              >
                Join
              </Link>
            </>
          ) : (
            <span className="hidden xl:inline max-w-[6rem] truncate text-xs text-neutral-500">{user.name?.split(" ")[0]}</span>
          )}
          <Link
            to={accountHref}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label={accountLabel}
          >
            <FaUser size={17} />
          </Link>
          <Link
            to="/wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Wishlist"
          >
            <FaHeart size={17} />
          </Link>
          <Link
            to="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Cart"
          >
            <FaShoppingCart size={17} />
          </Link>
        </div>
      </div>

      {/* Secondary category strip — desktop only, minimal */}
      <div className="hidden lg:block border-t border-neutral-100/80 bg-white/60">
        <nav
          className="max-w-[1600px] mx-auto flex justify-center gap-8 xl:gap-12 px-6 py-2.5"
          aria-label="Collections"
        >
          {[
            { label: "Men", segment: "men" },
            { label: "Women", segment: "women" },
            { label: "Kids", segment: "kids" },
          ].map(({ label, segment }) => {
            const segmentParam = new URLSearchParams(location.search).get("segment");
            const active = location.pathname === "/catalog" && segmentParam === segment;
            return (
              <Link
                key={segment}
                to={`/catalog?segment=${segment}`}
                className={`text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors border-b-2 pb-0.5 ${
                  active ? "text-neutral-900 border-neutral-900" : "text-neutral-500 border-transparent hover:text-neutral-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            to="/editions"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 border-b-2 border-transparent hover:text-neutral-900 pb-0.5 transition-colors"
          >
            Editions
          </Link>
        </nav>
      </div>
    </header>
  );
}
