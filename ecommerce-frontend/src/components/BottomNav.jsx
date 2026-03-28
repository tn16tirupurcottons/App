import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaShoppingCart, FaHeart, FaEllipsisH } from "react-icons/fa";

const items = [
  { to: "/", label: "Home", Icon: FaHome },
  { to: "/cart", label: "Cart", Icon: FaShoppingCart },
  { to: "/wishlist", label: "Saved", Icon: FaHeart },
  { to: "/catalog", label: "Shop", Icon: FaEllipsisH },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-200 md:hidden z-50">
      <div className="flex justify-around items-stretch text-neutral-500 max-w-lg mx-auto">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={label}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-3 px-3 text-[9px] font-bold uppercase tracking-widest flex-1 min-h-[56px] transition duration-200 ease-in-out ${
                isActive ? "text-neutral-900" : "hover:text-neutral-700"
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
