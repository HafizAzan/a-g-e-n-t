/**
 * Builds up to two initials from a person's name.
 * Example: "Ayesha Khan" → "AK"
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
