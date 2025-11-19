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
      <div className="w-full min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full pb-24 md:pb-0">
        <Outlet />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
