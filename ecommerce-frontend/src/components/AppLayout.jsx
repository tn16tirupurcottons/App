import React, { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import SideMenu from "./SideMenu";
import { AuthContext } from "../context/AuthContext";
import "../admin/admin.css";

const getPageBackground = () => "bg-white";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const pageBackground = getPageBackground();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (isAdminRoute) {
    return (
      <div className="admin-app min-h-screen w-full bg-white text-neutral-900 flex flex-col antialiased">
        <main className="flex-1 w-full bg-white">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen flex flex-col ${pageBackground} text-neutral-900 overflow-x-hidden transition-colors duration-300`}
    >
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={() => {
          logout();
          setMenuOpen(false);
          navigate("/");
        }}
      />
      <main
        className={`flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ${
          isHomePage
            ? "pt-[7.75rem] md:pt-[4.25rem] lg:pt-[4.25rem]"
            : "pt-[7.75rem] md:pt-[4.25rem] lg:pt-[4.25rem]"
        } min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-6rem)] pb-24 sm:pb-10 md:pb-12 overflow-x-hidden`}
      >
        {isHomePage ? (
          <Outlet />
        ) : (
          <div className="min-h-full rounded-2xl border border-neutral-200/90 bg-white shadow-sm sm:rounded-3xl">
            <div className="p-4 sm:px-8 sm:py-8 md:px-10 md:py-10">
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
