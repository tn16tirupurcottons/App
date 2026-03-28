/** UUID v1–v5 pattern (matches backend wishlist validation). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  if (value == null) return false;
  return UUID_RE.test(String(value).trim());
}

/** Catalog query: treat "all" / empty as no category filter. */
export function normalizeCategorySlug(slug) {
  if (slug == null) return "";
  const s = String(slug).trim();
  if (!s || s.toLowerCase() === "all") return "";
  return s;
}
