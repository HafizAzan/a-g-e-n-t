/**
 * Types for AI search runs shown on the Dashboard.
 */
export type SearchRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "partial";

export type SearchRun = {
  id: string;
  /** Short human-readable title for the search */
  title: string;
  /** One-line summary of criteria */
  summary: string;
  status: SearchRunStatus;
  leadCount: number;
  createdAt: string;
  /** 0–100 while running; 100 when done */
  progressPercent: number;
};
