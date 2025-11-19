import React, { useState } from "react";
import { Menu, X, Search, ShoppingBag, Heart, Home, User } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
      {/* Top Bar: Menu Button, Logo, Icons */}
      <div className="flex items-center justify-between px-4 py-3 md:max-w-7xl md:mx-auto">
        {/* Left Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Centered Logo */}
        <div className="flex-1 flex justify-center md:justify-center items-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h1 className="ml-2 text-xl font-bold text-gray-800 hidden md:block">
            LimeTrend
          </h1>
        </div>

        {/* Right Icons on Mobile: Profile Icon and Shopping Bag */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile Profile Icon */}
          <div className="md:hidden relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Toggle profile menu"
            >
              <User size={24} />
            </button>
            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute top-12 right-0 bg-white border rounded-md shadow-lg py-2 w-40 z-50">
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
          </div>

          {/* Shopping Bag Icon */}
          <ShoppingBag className="w-5 h-5 cursor-pointer" />
        </div>

        {/* Desktop Login / Join Free Buttons */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          <a
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-pink-600"
          >
            Login
          </a>
          <button className="px-4 py-1 text-sm bg-pink-600 text-white rounded-full hover:bg-pink-700">
            Join Free
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-t z-40">
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Women
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Men
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Kids
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Gen Z
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Home & Living
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium">
            Beauty
          </a>
          <a href="#" className="p-4 border-b hover:bg-gray-50 font-medium flex items-center justify-between">
            Studio <span className="text-xs text-pink-500 font-semibold">NEW</span>
          </a>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center py-2 shadow-inner">
        <a href="#" className="flex flex-col items-center text-gray-600">
          <Home size={20} />
          <span className="text-xs">Home</span>
        </a>
        <a href="#" className="flex flex-col items-center text-gray-600">
          <ShoppingBag size={20} />
          <span className="text-xs">Cart</span>
        </a>
        <a href="#" className="flex flex-col items-center text-gray-600">
          <Heart size={20} />
          <span className="text-xs">Wishlist</span>
        </a>
        <a href="#" className="flex flex-col items-center text-gray-600">
          <Search size={20} />
          <span className="text-xs">More</span>
        </a>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-center items-center gap-8 py-3 text-gray-700 font-medium border-b">
        <a href="#" className="hover:text-pink-500 font-semibold">Home</a>
        <a href="#" className="hover:text-pink-500">Men</a>
        <a href="#" className="hover:text-pink-500">Women</a>
        <a href="#" className="hover:text-pink-500">Kids</a>
        <a href="#" className="hover:text-pink-500">Gen Z</a>
        <a href="#" className="hover:text-pink-500">Home & Living</a>
        <a href="#" className="hover:text-pink-500">Beauty</a>
        <a href="#" className="hover:text-pink-500 flex items-center gap-1">
          Studio <span className="text-xs text-pink-500 font-semibold">NEW</span>
        </a>
      </nav>
    </header>
  );
};

export default Header;
