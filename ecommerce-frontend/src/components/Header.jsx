import React, { useState } from "react";
import { Menu, X, Search, ShoppingBag, Heart, Home, User } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 py-2 md:py-3 md:max-w-7xl md:mx-auto">

        {/* MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-7 md:h-9 w-auto"
          />
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            LimeTrend
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* MOBILE: Profile Icon */}
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="md:hidden p-1 rounded-full hover:bg-gray-100"
            aria-label="Toggle profile menu"
          >
            <User size={24} />
          </button>

          {/* PROFILE DROPDOWN - MOBILE ONLY */}
          {profileMenuOpen && (
            <div className="absolute top-14 right-4 bg-white border rounded-md shadow-lg py-2 w-40 md:hidden z-50">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-pink-100"
                onClick={() => setProfileMenuOpen(false)}
              >
                Login
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-pink-100"
                onClick={() => setProfileMenuOpen(false)}
              >
                Join Free
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-pink-100"
                onClick={() => setProfileMenuOpen(false)}
              >
                Admin Login
              </a>
            </div>
          )}

          {/* DESKTOP: Login / Join Free buttons */}
          <a
            href="#"
            className="hidden md:inline-block text-sm font-medium text-gray-700 hover:text-pink-600"
          >
            Login
          </a>
          <button className="hidden md:inline-block px-3 py-1 text-sm bg-pink-600 text-white rounded-full hover:bg-pink-700">
            Join Free
          </button>

        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t flex flex-col z-40">
          <a className="p-3 border-b hover:bg-gray-100">Women</a>
          <a className="p-3 border-b hover:bg-gray-100">Men</a>
          <a className="p-3 border-b hover:bg-gray-100">Kids</a>
          <a className="p-3 hover:bg-gray-100">Home</a>
        </div>
      )}

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex justify-center gap-6 py-3 text-gray-700 font-medium border-t">
        <a className="hover:text-pink-600" href="#">Women</a>
        <a className="hover:text-pink-600" href="#">Men</a>
        <a className="hover:text-pink-600" href="#">Kids</a>
        <a className="hover:text-pink-600" href="#">Home</a>
      </nav>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center py-2 shadow-inner">
        <a className="flex flex-col items-center text-gray-600" href="#">
          <Home size={20} />
          <span className="text-xs">Home</span>
        </a>
        <a className="flex flex-col items-center text-gray-600" href="#">
          <ShoppingBag size={20} />
          <span className="text-xs">Cart</span>
        </a>
        <a className="flex flex-col items-center text-gray-600" href="#">
          <Heart size={20} />
          <span className="text-xs">Wishlist</span>
        </a>
        <a className="flex flex-col items-center text-gray-600" href="#">
          <Search size={20} />
          <span className="text-xs">More</span>
        </a>
      </nav>

    </header>
  );
};

export default Header;
