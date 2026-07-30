/**
 * helpers.js — small shared helpers.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function omitUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  );
}

export function createId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
