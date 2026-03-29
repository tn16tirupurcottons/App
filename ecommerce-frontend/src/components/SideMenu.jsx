import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaHome,
  FaThLarge,
  FaBoxOpen,
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt,
  FaChevronRight,
} from "react-icons/fa";

const linkClass =
  "w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-neutral-800 rounded-xl hover:bg-neutral-100 transition-colors duration-200";

const segmentLinks = [
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Kids", to: "/kids" },
  { label: "Accessories", to: "/accessories" },
];

/**
 * Sliding drawer: navigation + role-aware account actions.
 */
export default function SideMenu({ open, onClose, user, onLogout }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const t = requestAnimationFrame(() => panelRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  if (!open) return null;

  const go = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] md:z-[110]" aria-modal="true" role="dialog" aria-label="Navigation menu">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity z-0"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute top-0 left-0 z-[1] h-full w-[min(100vw-3rem,22rem)] sm:w-[min(90vw,380px)] bg-white shadow-2xl border-r border-neutral-200 flex flex-col outline-none touch-manipulation"
        style={{ animation: "sideMenuIn 280ms ease-out both" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900">Menu</span>
          <button
            type="button"
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-1" aria-label="Primary">
          <button type="button" onClick={() => go("/")} className={linkClass}>
            <span className="flex items-center gap-3">
              <FaHome className="text-neutral-500 shrink-0" aria-hidden />
              Home
            </span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>
          <button type="button" onClick={() => go("/catalog")} className={linkClass}>
            <span className="flex items-center gap-3">
              <FaThLarge className="text-neutral-500 shrink-0" aria-hidden />
              Shop / Products
            </span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>
          <button type="button" onClick={() => go("/orders")} className={linkClass}>
            <span className="flex items-center gap-3">
              <FaBoxOpen className="text-neutral-500 shrink-0" aria-hidden />
              Orders
            </span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>
          <button type="button" onClick={() => go("/cart")} className={linkClass}>
            <span className="flex items-center gap-3">
              <FaShoppingCart className="text-neutral-500 shrink-0" aria-hidden />
              Cart
            </span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>
          <button type="button" onClick={() => go("/wishlist")} className={linkClass}>
            <span className="flex items-center gap-3">
              <FaHeart className="text-neutral-500 shrink-0" aria-hidden />
              Wishlist
            </span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>

          <div className="pt-4 pb-2 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Collections</p>
          </div>
          {segmentLinks.map(({ label, to }) => (
            <button key={to} type="button" onClick={() => go(to)} className={linkClass}>
              <span className="flex items-center gap-3">{label}</span>
              <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
            </button>
          ))}

          <div className="pt-4 pb-2 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Editions</p>
          </div>
          <button type="button" onClick={() => go("/editions")} className={linkClass}>
            <span className="flex items-center gap-3">Lookbooks</span>
            <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
          </button>
        </nav>

        <div className="border-t border-neutral-100 p-4 space-y-3 bg-neutral-50/80">
          {!user ? (
            <Link
              to="/login"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-white py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors min-h-12"
            >
              <FaUser className="opacity-90" aria-hidden />
              Login
            </Link>
          ) : (
            <>
              <button type="button" onClick={() => go("/membership")} className={`${linkClass} bg-white shadow-sm`}>
                <span className="flex items-center gap-3">
                  <FaUser className="text-neutral-500 shrink-0" aria-hidden />
                  Profile
                </span>
                <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
              </button>
              {user.role === "admin" && (
                <button type="button" onClick={() => go("/admin")} className={`${linkClass} bg-white shadow-sm`}>
                  <span className="flex items-center gap-3">
                    <FaShieldAlt className="text-neutral-500 shrink-0" aria-hidden />
                    Admin Panel
                  </span>
                  <FaChevronRight className="text-neutral-300 text-xs shrink-0" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors min-h-12"
              >
                <FaSignOutAlt aria-hidden />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes sideMenuIn {
          from { transform: translateX(-100%); opacity: 0.96; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
