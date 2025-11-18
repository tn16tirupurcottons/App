import React, { useState } from "react";
import { Menu, X, Search, ShoppingBag, Heart, Home } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
      {/* Top bar for logo + menu + icons */}
      <div className="flex items-center justify-between px-4 py-3 md:max-w-7xl md:mx-auto">
        {/* Left Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <div className="flex-1 flex justify-center md:justify-start items-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h1 className="ml-2 text-xl font-bold text-gray-800 hidden md:block">
            LimeTrend
          </h1>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 md:gap-2">
          <Search className="w-5 h-5 cursor-pointer md:hidden" />
          <ShoppingBag className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-t">
          <a href="#" className="p-3 border-b hover:bg-gray-50">Women</a>
          <a href="#" className="p-3 border-b hover:bg-gray-50">Men</a>
          <a href="#" className="p-3 border-b hover:bg-gray-50">Kids</a>
          <a href="#" className="p-3 hover:bg-gray-50">Home</a>
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
      <nav className="hidden md:flex justify-center gap-6 py-2 text-gray-700 font-medium border-b">
        <a href="#" className="hover:text-pink-500">Women</a>
        <a href="#" className="hover:text-pink-500">Men</a>
        <a href="#" className="hover:text-pink-500">Kids</a>
        <a href="#" className="hover:text-pink-500">Home</a>
      </nav>
    </header>
  );
};

export default Header;
