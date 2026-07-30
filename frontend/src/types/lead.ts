/**
 * Lead type used across the app.
 * Keep this simple until the backend API is connected.
 */
export type LeadStatus = "new" | "contacted" | "qualified" | "archived";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  title: string;
  location: string;
  status: LeadStatus;
  /** Match score from 0–100 (mock for now) */
  score: number;
  website?: string;
  createdAt: string;
  /** Which search run produced this lead */
  searchId?: string;
};
