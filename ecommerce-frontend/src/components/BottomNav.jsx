import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaShoppingCart, FaHeart, FaStore } from "react-icons/fa";

const items = [
  { to: "/", label: "Home", Icon: FaHome },
  { to: "/cart", label: "Cart", Icon: FaShoppingCart },
  { to: "/wishlist", label: "Saved", Icon: FaHeart },
  { to: "/catalog", label: "Shop", Icon: FaStore },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl border border-neutral-200/90 border-b-0 bg-white/95 backdrop-blur-lg shadow-[0_-8px_32px_-4px_rgba(0,0,0,0.12)]"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={label}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2 px-2 flex-1 min-h-12 rounded-xl transition-colors duration-200 ease-out ${
                isActive ? "text-neutral-900 bg-neutral-100" : "text-neutral-500 hover:text-neutral-800"
              }`
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
