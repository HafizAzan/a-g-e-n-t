/**
 * Dropdown options for the New Search form (mock lists).
 */

export const businessTypeOptions = [
  "Restaurant",
  "Cafe",
  "Dental Clinic",
  "Law Firm",
  "Real Estate Agency",
  "Gym / Fitness",
  "Hair Salon",
  "Auto Repair",
  "SaaS Company",
  "Marketing Agency",
] as const;

export const countryOptions = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Pakistan",
  "Singapore",
] as const;

/** Mock states/provinces keyed by country */
export const stateOptionsByCountry: Record<string, string[]> = {
  "United States": ["California", "Texas", "New York", "Florida", "Illinois"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Canada: ["Ontario", "British Columbia", "Quebec", "Alberta"],
  Australia: ["New South Wales", "Victoria", "Queensland", "Western Australia"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Pakistan: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Islamabad Capital Territory"],
  Singapore: ["Central", "East", "North", "West"],
};

/** Mock cities keyed by "Country|State" */
export const cityOptionsByState: Record<string, string[]> = {
  "United States|California": ["Los Angeles", "San Francisco", "San Diego"],
  "United States|Texas": ["Austin", "Houston", "Dallas"],
  "United States|New York": ["New York City", "Buffalo", "Rochester"],
  "United States|Florida": ["Miami", "Orlando", "Tampa"],
  "United States|Illinois": ["Chicago", "Springfield"],
  "United Kingdom|England": ["London", "Manchester", "Birmingham"],
  "United Kingdom|Scotland": ["Edinburgh", "Glasgow"],
  "United Kingdom|Wales": ["Cardiff", "Swansea"],
  "United Kingdom|Northern Ireland": ["Belfast"],
  "Canada|Ontario": ["Toronto", "Ottawa"],
  "Canada|British Columbia": ["Vancouver", "Victoria"],
  "Canada|Quebec": ["Montreal", "Quebec City"],
  "Canada|Alberta": ["Calgary", "Edmonton"],
  "Australia|New South Wales": ["Sydney", "Newcastle"],
  "Australia|Victoria": ["Melbourne", "Geelong"],
  "Australia|Queensland": ["Brisbane", "Gold Coast"],
  "Australia|Western Australia": ["Perth"],
  "United Arab Emirates|Dubai": ["Dubai City", "Marina"],
  "United Arab Emirates|Abu Dhabi": ["Abu Dhabi City"],
  "United Arab Emirates|Sharjah": ["Sharjah City"],
  "Pakistan|Punjab": ["Lahore", "Rawalpindi", "Faisalabad"],
  "Pakistan|Sindh": ["Karachi", "Hyderabad"],
  "Pakistan|Khyber Pakhtunkhwa": ["Peshawar"],
  "Pakistan|Islamabad Capital Territory": ["Islamabad"],
  "Singapore|Central": ["Downtown Core", "Orchard"],
  "Singapore|East": ["Tampines", "Bedok"],
  "Singapore|North": ["Woodlands", "Yishun"],
  "Singapore|West": ["Jurong East", "Clementi"],
};

export function getStatesForCountry(country: string) {
  return stateOptionsByCountry[country] ?? [];
}

export function getCitiesForState(country: string, state: string) {
  return cityOptionsByState[`${country}|${state}`] ?? [];
}
