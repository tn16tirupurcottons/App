import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

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
    <div className="w-full min-h-screen flex flex-col bg-[var(--background-color)] text-[var(--text-color)] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] pb-20 sm:pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
