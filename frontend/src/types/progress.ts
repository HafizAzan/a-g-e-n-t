/**
 * Types for the Search Progress screen (fake pipeline).
 */

export type ProgressStageId =
  | "businesses"
  | "website"
  | "contacts"
  | "ai"
  | "csv";

export type ProgressStageStatus = "pending" | "active" | "done" | "failed";

export type ProgressStage = {
  id: ProgressStageId;
  label: string;
  description: string;
  status: ProgressStageStatus;
};

export type ProgressLogLevel = "info" | "success" | "warning";

export type ProgressLog = {
  id: string;
  time: string;
  message: string;
  level: ProgressLogLevel;
};

export type FakeProgressSnapshot = {
  percent: number;
  currentStageId: ProgressStageId;
  stages: ProgressStage[];
  businessesFound: number;
  websitesAnalyzed: number;
  contactsExtracted: number;
  estimatedSecondsLeft: number;
  logs: ProgressLog[];
  isComplete: boolean;
  isCancelled: boolean;
};
