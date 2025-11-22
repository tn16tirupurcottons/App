import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

// Page-specific background styles
const getPageBackground = (pathname) => {
  const backgrounds = {
    "/": "bg-gradient-to-br from-white via-gray-50 to-gray-100",
    "/catalog": "bg-gradient-to-br from-gray-50 via-white to-blue-50/30",
    "/cart": "bg-gradient-to-br from-white via-pink-50/20 to-purple-50/20",
    "/wishlist": "bg-gradient-to-br from-white via-rose-50/20 to-pink-50/20",
    "/product": "bg-gradient-to-br from-white via-gray-50 to-blue-50/20",
    "/checkout": "bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20",
    "/login": "bg-gradient-to-br from-white via-gray-50 to-slate-50",
    "/register": "bg-gradient-to-br from-white via-gray-50 to-slate-50",
    "/forgot-password": "bg-gradient-to-br from-white via-gray-50 to-slate-50",
    "/reset-password": "bg-gradient-to-br from-white via-gray-50 to-slate-50",
    "/about": "bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20",
    "/shipping": "bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20",
    "/membership": "bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20",
    "/orders": "bg-gradient-to-br from-white via-green-50/20 to-emerald-50/20",
  };

  // Check for exact matches first
  if (backgrounds[pathname]) {
    return backgrounds[pathname];
  }

  // Check for path prefixes
  if (pathname.startsWith("/product/")) {
    return backgrounds["/product"];
  }
  if (pathname.startsWith("/orders/")) {
    return backgrounds["/orders"];
  }

  // Default background
  return "bg-gradient-to-br from-white via-gray-50 to-gray-100";
};

export default function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const pageBackground = getPageBackground(location.pathname);

  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-[#f7f8fb] text-dark flex flex-col">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen flex flex-col ${pageBackground} text-[var(--text-color)] overflow-x-hidden transition-colors duration-300`}>
      <Navbar />
      <main className="flex-1 w-full max-w-[98%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] pb-24 sm:pb-6 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
