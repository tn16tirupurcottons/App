import React from "react";
import { indianStates, indianCities } from "../data/indianLocations";

export default function LocationSelect({ 
  country = "India", 
  state, 
  city, 
  onStateChange, 
  onCityChange,
  required = false 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      {/* Country - Read-only */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-dark/70 mb-1.5">Country</label>
        <input
          type="text"
          value={country}
          readOnly
          className="w-full border border-border bg-gray-50 rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-dark cursor-not-allowed"
        />
      </div>
      
      {/* State - Dropdown */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-dark/70 mb-1.5">
          State {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={state || ""}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange(""); // Reset city when state changes
          }}
          className="w-full border border-border bg-white rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-dark focus:outline-none focus:border-primary"
          required={required}
        >
          <option value="">Select State</option>
          {indianStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      
      {/* City - Dropdown (depends on state) */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-dark/70 mb-1.5">
          City {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={city || ""}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!state}
          className="w-full border border-border bg-white rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-dark focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
          required={required}
        >
          <option value="">Select City</option>
          {state && indianCities[state]?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

