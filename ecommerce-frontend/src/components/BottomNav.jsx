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
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-border shadow-medium md:hidden z-40">
      <div className="flex justify-around text-muted">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={label}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition ${
                isActive ? "text-primary" : "text-muted hover:text-dark"
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

