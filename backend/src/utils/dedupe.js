/** dedupe helper (used later when Places is wired). */
export function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function removeDuplicateBusinesses(businesses) {
  const seen = new Set();
  const out = [];
  for (const b of businesses || []) {
    const key = `${normalizeName(b.businessName)}|${String(b.phone || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(b);
  }
  return out;
}
