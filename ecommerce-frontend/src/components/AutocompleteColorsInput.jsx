import React, { useState, useEffect, useRef } from "react";

export default function AutocompleteColorsInput({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = "",
  disabled = false,
  className = "",
  ...rest
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Extract the last color being typed (after the last comma)
  const getLastColor = (str) => {
    const parts = str.split(",");
    return parts[parts.length - 1]?.trim() || "";
  };

  // Get all colors before the last one
  const getPreviousColors = (str) => {
    const parts = str.split(",");
    if (parts.length <= 1) return "";
    return parts.slice(0, -1).join(",").trim();
  };

  useEffect(() => {
    if (suggestions.length > 0 && !disabled) {
      const lastColor = getLastColor(value);
      if (lastColor) {
        // Filter suggestions based on the last color being typed
        const filtered = suggestions.filter((s) =>
          s.toLowerCase().includes(lastColor.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        // Show all suggestions when no color is being typed
        setFilteredSuggestions(suggestions);
      }
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, suggestions, disabled]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    const previousColors = getPreviousColors(value);
    const newValue = previousColors
      ? `${previousColors}, ${suggestion}`
      : suggestion;
    onChange({ target: { value: newValue } });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const lastColor = getLastColor(value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        <span className="block mb-1.5">{label}</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0 && !disabled) {
              const lastColor = getLastColor(value);
              if (lastColor) {
                // Filter suggestions based on the last color being typed
                const filtered = suggestions.filter((s) =>
                  s.toLowerCase().includes(lastColor.toLowerCase())
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
              } else {
                // Show all suggestions when no color is being typed
                setFilteredSuggestions(suggestions);
                setShowSuggestions(true);
              }
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition ${
            disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white"
          }`}
          {...rest}
        />
        {disabled && !value && (
          <p className="text-xs text-gray-400 mt-1 ml-1">
            Please select a category first
          </p>
        )}
        {!disabled && suggestions.length > 0 && (
          <p className="text-xs text-gray-400 mt-1 ml-1">
            {suggestions.length} color suggestion{suggestions.length !== 1 ? "s" : ""} available
            {lastColor && filteredSuggestions.length !== suggestions.length && (
              <span className="text-gray-500"> • {filteredSuggestions.length} match{filteredSuggestions.length !== 1 ? "es" : ""}</span>
            )}
          </p>
        )}
      </label>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                highlightedIndex === index
                  ? "bg-pink-50 text-pink-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
