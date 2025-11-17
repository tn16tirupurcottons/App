import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaShoppingBag,
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaCrown,
} from "react-icons/fa";

const primaryLinks = [
  { label: "Men", slug: "mens-shirts" },
  { label: "Women", slug: "women-kurtas" },
  { label: "Kids", slug: "kids-wear" },
  { label: "Home", slug: "home-decor" },
  { label: "Beauty", slug: "beauty" },
  { label: "Genz", slug: "genz" },
  { label: "Studio", slug: "studio" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const brand = import.meta.env.VITE_BRAND_NAME || "TN16 Tirupur Cotton";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 via-white to-orange-50 text-xs text-pink-600 tracking-[0.4em] text-center py-1 font-semibold">
        PREMIUM COTTON FWD HAUL
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-black grid place-items-center">
              TN16
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 leading-tight">
                {brand}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-pink-500">
                Tirupur Cotton Studio
              </p>
            </div>
          </Link>

          <div className="flex-1 min-w-[220px] max-w-lg hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="flex-1 bg-transparent text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  navigate(
                    `/catalog?query=${encodeURIComponent(e.target.value)}`
                  );
                }
              }}
            />
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold text-gray-800">
            <Link
              to="/cart"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-pink-600"
            >
              <FaShoppingCart /> Cart
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-sm text-gray-600">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hover:text-pink-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-pink-600 px-4 py-2 rounded-full hover:bg-pink-700"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-6 py-2 text-sm font-semibold text-gray-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-pink-600" : "hover:text-pink-600"
            }
          >
            Home
          </NavLink>
          {primaryLinks.map((link) => (
            <NavLink
              key={link.slug}
              to={`/catalog?category=${link.slug}`}
              className={({ isActive }) =>
                isActive ? "text-pink-600" : "hover:text-pink-600 transition"
              }
            >
              {link.label}
              {link.label === "Studio" && (
                <span className="text-[10px] text-pink-500 ml-1">NEW</span>
              )}
            </NavLink>
          ))}
          <nav className="ml-auto flex gap-4 text-xs uppercase tracking-[0.4em] text-pink-500">
            <span className="flex items-center gap-1">
              <FaCrown /> Premium
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
