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

  // Check if current page is Home page (needs special layout)
  const isHomePage = location.pathname === "/";

  return (
    <div className={`w-full min-h-screen flex flex-col ${pageBackground} text-[var(--text-color)] overflow-x-hidden transition-colors duration-300`}>
      <Navbar />
      {/* Add padding-top to account for fixed header - responsive heights (header is ~118px mobile, ~160px desktop) */}
      <main className={`flex-1 w-full max-w-[98%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 ${isHomePage ? 'pt-[118px] sm:pt-[130px] md:pt-[160px]' : 'pt-[118px] sm:pt-[130px] md:pt-[160px]'} min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] pb-24 sm:pb-6 md:pb-0`}>
        {isHomePage ? (
          // Home page - no content wrapper, direct outlet
          <Outlet />
        ) : (
          // Other pages - with content wrapper
          <div className="bg-white/70 backdrop-blur-[1px] rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100/50 min-h-full">
            <div className="p-4 sm:p-6 md:p-8">
              <Outlet />
            </div>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
