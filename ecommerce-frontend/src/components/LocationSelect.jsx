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
    <>
      {/* Country - Read-only */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">Country</label>
        <input
          type="text"
          value={country}
          readOnly
          className="w-full border border-border bg-gray-50 rounded-full px-4 py-3 text-dark cursor-not-allowed"
        />
      </div>
      
      {/* State - Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-dark mb-1.5">
          State {required && "*"}
        </label>
        <select
          value={state || ""}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange(""); // Reset city when state changes
          }}
          className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
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
        <label className="block text-sm font-semibold text-dark mb-1.5">
          City {required && "*"}
        </label>
        <select
          value={city || ""}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!state}
          className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
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
    </>
  );
}

