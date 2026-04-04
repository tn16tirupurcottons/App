import React, { memo } from "react";

const FilterSidebar = memo(function FilterSidebar({
  query,
  onChange,
  categories = [],
  isMobileOpen = false,
  onMobileToggle,
}) {
  const sizes = ["S", "M", "L", "XL"];
  const colors = ["White", "Black", "Blue", "Pink", "Green", "Red", "Beige"];
  const brands = ["TN16", "CottonCo", "LoomCraft", "DailyWear"];

  const rootCategories = categories.filter((cat) => !cat.parentId);
  const selectedMainCategory = categories.find((cat) => cat.slug === query.categorySlug);
  const subCategories = categories.filter((cat) => cat.parentId === selectedMainCategory?.id);

  const toggleArrayFilter = (field, value) => {
    const current = Array.isArray(query[field]) ? query[field] : [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange(field, next);
  };

  const handleCategoryChange = (value) => {
    onChange("categorySlug", value);
    onChange("subCategorySlug", "");
    if (isMobileOpen) onMobileToggle();
  };

  const handleSubCategoryChange = (value) => {
    onChange("subCategorySlug", value);
    if (isMobileOpen) onMobileToggle();
  };

  const clearFilters = () => {
    onChange("categorySlug", "");
    onChange("subCategorySlug", "");
    onChange("size", []);
    onChange("color", []);
    onChange("brand", []);
    if (isMobileOpen) onMobileToggle();
  };

  const activeFilters = [
    query.categorySlug && `Category: ${selectedMainCategory?.name || query.categorySlug}`,
    query.subCategorySlug && `Subcategory: ${categories.find((cat) => cat.slug === query.subCategorySlug)?.name || query.subCategorySlug}`,
    ...(Array.isArray(query.size) ? query.size : []).map((size) => `Size: ${size}`),
    ...(Array.isArray(query.color) ? query.color : []).map((color) => `Color: ${color}`),
    ...(Array.isArray(query.brand) ? query.brand : []).map((brand) => `Brand: ${brand}`),
  ].filter(Boolean);

  const sidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Category</h3>
        <select
          value={query.categorySlug || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"
        >
          <option value="">All categories</option>
          {rootCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Sub-category</h3>
        <select
          value={query.subCategorySlug || ""}
          onChange={(e) => handleSubCategoryChange(e.target.value)}
          disabled={!query.categorySlug || subCategories.length === 0}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 disabled:opacity-60"
        >
          <option value="">All sub-categories</option>
          {subCategories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = Array.isArray(query.size) && query.size.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayFilter("size", size)}
                className={`px-3 py-1 rounded-lg border text-sm transition ${active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-900"}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const active = Array.isArray(query.color) && query.color.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleArrayFilter("color", color)}
                className={`px-3 py-1 rounded-lg border text-sm transition ${active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-900"}`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => {
            const active = Array.isArray(query.brand) && query.brand.includes(brand);
            return (
              <label key={brand} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleArrayFilter("brand", brand)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className={active ? "text-neutral-900" : "text-neutral-600"}>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900 mb-3">Applied filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((label) => (
              <span key={label} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="w-full py-2 px-4 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={onMobileToggle}
          className="w-full py-3 px-4 bg-white border border-neutral-200 rounded-lg text-left flex items-center justify-between hover:border-neutral-300 transition-colors"
        >
          <span className="text-sm font-medium text-neutral-900">Filters</span>
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onMobileToggle} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
              <button
                type="button"
                onClick={onMobileToggle}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-20 bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filters</h2>
          {sidebarContent}
        </div>
      </div>
    </>
  );
});

export default FilterSidebar;
