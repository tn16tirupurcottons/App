import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Tags,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin" },
    { name: "Products", icon: <ShoppingBag size={18} />, path: "/admin/products" },
    { name: "Orders", icon: <ListOrdered size={18} />, path: "/admin/orders" },
    { name: "Categories", icon: <Tags size={18} />, path: "/admin/categories" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white p-4 w-64 transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform md:translate-x-0 z-40`}
      >
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-3">
          {menu.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 
                ${pathname === item.path ? "bg-gray-700" : ""}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
