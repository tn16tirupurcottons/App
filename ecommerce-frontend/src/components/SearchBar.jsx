import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({ placeholder = "Search pieces, collections, artisans", className = "", style = {}, onClose, showCloseButton = false, autoFocus = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Auto-focus when component mounts if autoFocus is true
  useEffect(() => {
    if (autoFocus && searchRef.current) {
      searchRef.current.focus();
    }
  }, [autoFocus]);

  // Fetch search suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ["searchSuggestions", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { products: [], categories: [] };
      
      try {
        const res = await axiosClient.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const products = res.data.items || [];
        
        // Also get categories
        const catRes = await axiosClient.get("/categories");
        const categories = (catRes.data.items || []).filter((cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3);
        
        return { products, categories };
      } catch (error) {
        console.error("Search suggestions error:", error);
        return { products: [], categories: [] };
      }
    },
    enabled: searchQuery.length >= 2,
  });

  const suggestions = suggestionsData || { products: [], categories: [] };
  const hasSuggestions = (suggestions.products?.length > 0 || suggestions.categories?.length > 0) && searchQuery.length >= 2;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleTouchOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, []);

  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    navigate(`/catalog?query=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    setSearchQuery("");
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(searchQuery);
    } else if (e.key === "ArrowDown" && hasSuggestions) {
      e.preventDefault();
      const totalSuggestions = (suggestions.products?.length || 0) + (suggestions.categories?.length || 0);
      setHighlightedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : prev));
      setShowSuggestions(true);
    } else if (e.key === "ArrowUp" && hasSuggestions) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (item, type) => {
    if (type === "product") {
      navigate(`/product/${item.id}`);
    } else if (type === "category") {
      navigate(`/catalog?category=${item.slug}`);
    } else {
      handleSearch(item.name || item);
    }
    setShowSuggestions(false);
    setSearchQuery("");
    if (onClose) onClose();
  };

  let suggestionIndex = 0;

  return (
    <div className={`relative ${className}`} style={style}>
      <div className="flex items-center gap-2 w-full bg-black/5 backdrop-blur-md border rounded-full px-5 py-2 shadow-lg" style={{ borderColor: style.borderColor || "rgba(10,10,10,0.2)" }}>
        <FaSearch style={{ color: style.color ? `${style.color}CC` : "rgba(10,10,10,0.7)" }} />
        <input
          ref={searchRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (hasSuggestions) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ 
            color: style.color || "#0a0a0a",
          }}
        />
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex-shrink-0 p-1 hover:opacity-70 transition"
            style={{ color: style.color ? `${style.color}CC` : "rgba(10,10,10,0.7)" }}
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>

      {showSuggestions && hasSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl max-h-80 overflow-auto scrollbar-hide"
          style={{
            maxHeight: "min(20rem, calc(100vh - 12rem))",
          }}
        >
          {suggestions.categories?.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </div>
              {suggestions.categories.map((category) => {
                const index = suggestionIndex++;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSuggestionClick(category, "category")}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition flex items-center gap-2 ${
                      index === highlightedIndex ? "bg-pink-100" : ""
                    }`}
                  >
                    <span className="text-pink-600">📁</span>
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {suggestions.products?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Products
              </div>
              {suggestions.products.map((product) => {
                const index = suggestionIndex++;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSuggestionClick(product, "product")}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition flex items-center gap-3 ${
                      index === highlightedIndex ? "bg-pink-100" : ""
                    }`}
                  >
                    <img
                      src={product.thumbnail || "/placeholder.png"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">₹{product.price}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-pink-600 hover:bg-pink-50 transition"
            >
              Search for "{searchQuery}"
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

