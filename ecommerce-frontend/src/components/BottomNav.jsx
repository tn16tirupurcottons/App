import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaHeart,
  FaEllipsisH,
} from "react-icons/fa";

const items = [
  { to: "/", label: "Home", Icon: FaHome },
  { to: "/cart", label: "Cart", Icon: FaShoppingCart },
  { to: "/wishlist", label: "Wishlist", Icon: FaHeart },
  { to: "/catalog", label: "More", Icon: FaEllipsisH },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center text-muted">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={label}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 px-2 sm:px-4 text-[10px] sm:text-[11px] font-medium transition active:scale-95 min-h-[60px] ${
                isActive ? "text-primary" : "text-muted hover:text-dark"
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span className="leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

