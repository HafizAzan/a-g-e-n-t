/**
 * One row in the Search Results table.
 */
export type WebsiteStatus = "good" | "poor" | "none" | "unknown";

export type ResultLead = {
  id: string;
  searchId?: string;
  business: string;
  phone: string;
  email: string;
  website: string;
  websiteStatus: WebsiteStatus;
  leadScore: number;
  rating: number;
  reviews: number;
  city: string;
  country: string;
};
