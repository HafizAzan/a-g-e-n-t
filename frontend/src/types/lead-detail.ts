import type { ResultLead, WebsiteStatus } from "@/types/result-lead";

/**
 * Extra fields shown only on the Lead Details page.
 */
export type LeadDetail = ResultLead & {
  address: string;
  state: string;
  category: string;
  description: string;
  /** Approximate coords for the static map preview */
  latitude: number;
  longitude: number;
  websiteAnalysis: {
    loadSpeed: string;
    mobileFriendly: boolean;
    https: boolean;
    brokenLinks: number;
    lastChecked: string;
    summary: string;
  };
  seoAnalysis: {
    titleTag: string;
    metaDescription: string;
    h1Count: number;
    indexedPages: number;
    score: number;
    issues: string[];
  };
  technologyStack: string[];
  googleReviews: {
    author: string;
    rating: number;
    date: string;
    text: string;
  }[];
  aiNotes: string[];
  scoreBreakdown: {
    label: string;
    value: number;
  }[];
};
