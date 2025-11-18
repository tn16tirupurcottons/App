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
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden z-40">
      <div className="flex justify-around">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={label}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
                isActive ? "text-pink-600" : "text-gray-500"
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

