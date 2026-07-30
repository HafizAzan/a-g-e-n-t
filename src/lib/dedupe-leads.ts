import type { Lead } from "@/types/lead";

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Removes duplicate businesses using the rules from not-duplicate.md:
 * same email, phone, website, Google Maps URL, or business name + city.
 */
export function dedupeLeads(leads: Lead[]): Lead[] {
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const seenWebsites = new Set<string>();
  const seenMaps = new Set<string>();
  const seenNameCity = new Set<string>();
  const unique: Lead[] = [];

  for (const lead of leads) {
    const email = normalizeKey(lead.email);
    const phone = normalizeKey(lead.phone).replace(/[^\d+]/g, "");
    const website = normalizeKey(lead.website).replace(/\/$/, "");
    const maps = normalizeKey(lead.googleMapsLink);
    const nameCity = `${normalizeKey(lead.businessName)}|${normalizeKey(lead.city)}`;

    const isDuplicate =
      (email && seenEmails.has(email)) ||
      (phone && seenPhones.has(phone)) ||
      (website && seenWebsites.has(website)) ||
      (maps && seenMaps.has(maps)) ||
      (lead.businessName && seenNameCity.has(nameCity));

    if (isDuplicate) {
      continue;
    }

    if (email) seenEmails.add(email);
    if (phone) seenPhones.add(phone);
    if (website) seenWebsites.add(website);
    if (maps) seenMaps.add(maps);
    if (lead.businessName) seenNameCity.add(nameCity);

    unique.push(lead);
  }

  return unique;
}
