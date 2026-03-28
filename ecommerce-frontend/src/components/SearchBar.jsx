import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({
  placeholder = "Search pieces, collections, artisans",
  className = "",
  style = {},
  onClose,
  showCloseButton = false,
  autoFocus = false,
  variant = "light",
}) {
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

  const shellClass =
    "flex items-center gap-3 w-full rounded-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-200 text-neutral-900 shadow-sm shadow-neutral-900/5 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:shadow-md transition-all duration-300 ease-out";

  return (
    <div className={`relative ${className}`} style={style}>
      <div className={shellClass} style={style}>
        <FaSearch
          className="flex-shrink-0 text-[#555555]"
          style={{ fontSize: "16px" }}
        />
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
          className="flex-1 bg-transparent text-sm focus:outline-none text-[#000000] placeholder:text-[#555555]"
        />
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex-shrink-0 p-1 transition ease-in-out text-[#555555] hover:text-[#000000]"
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>

      {showSuggestions && hasSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 rounded-2xl shadow-lg max-h-80 overflow-auto scrollbar-hide border border-[#E5E7EB] bg-white text-[#000000]"
          style={{
            maxHeight: "min(20rem, calc(100vh - 12rem))",
          }}
        >
          {suggestions.categories?.length > 0 && (
            <div className="border-b border-[#E5E7EB]">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#555555]">
                Categories
              </div>
              {suggestions.categories.map((category) => {
                const index = suggestionIndex++;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSuggestionClick(category, "category")}
                    className={`w-full text-left px-4 py-3 text-sm transition ease-in-out flex items-center gap-2 text-[#000000] hover:bg-neutral-50 ${
                      index === highlightedIndex ? "bg-neutral-100" : ""
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 shrink-0" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {suggestions.products?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#555555]">
                Products
              </div>
              {suggestions.products.map((product) => {
                const index = suggestionIndex++;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSuggestionClick(product, "product")}
                    className={`w-full text-left px-4 py-3 text-sm transition ease-in-out flex items-center gap-3 text-[#000000] hover:bg-neutral-50 ${
                      index === highlightedIndex ? "bg-neutral-100" : ""
                    }`}
                  >
                    <img
                      src={product.thumbnail || "/placeholder.png"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg bg-zinc-800"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-[#000000]">
                        {product.name}
                      </div>
                      <div className="text-xs text-[#555555]">
                        ₹{product.price}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => handleSearch(searchQuery)}
              className="w-full text-left px-4 py-3 text-sm font-semibold transition ease-in-out text-[#000000] hover:bg-neutral-50"
            >
              Search for &quot;{searchQuery}&quot;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

