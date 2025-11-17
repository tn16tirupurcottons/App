import React, { useState } from "react";
import { Menu, X, Search, ShoppingBag } from "lucide-react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b bg-white fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-gray-800">LimeTrend</h1>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="#" className="hover:text-pink-500">Women</a>
          <a href="#" className="hover:text-pink-500">Men</a>
          <a href="#" className="hover:text-pink-500">Kids</a>
          <a href="#" className="hover:text-pink-500">Home</a>
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 cursor-pointer" />
          <ShoppingBag className="w-5 h-5 cursor-pointer" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white border-t">
          <a href="#" className="p-3 border-b hover:bg-gray-50">Women</a>
          <a href="#" className="p-3 border-b hover:bg-gray-50">Men</a>
          <a href="#" className="p-3 border-b hover:bg-gray-50">Kids</a>
          <a href="#" className="p-3 hover:bg-gray-50">Home</a>
        </div>
      )}
    </header>
  );
};

export default Header;
