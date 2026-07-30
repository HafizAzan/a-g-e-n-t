import type { Lead } from "@/types/lead";

export type EmailSendStatus =
  | "pending"
  | "draft"
  | "approved"
  | "sending"
  | "sent"
  | "failed"
  | "skipped";

export type EmailTemplateId =
  | "website-redesign"
  | "seo"
  | "automation"
  | "ai-chatbot"
  | "custom";

export type EmailTemplate = {
  id: EmailTemplateId;
  name: string;
  subjectHint: string;
  offer: string;
  callToAction: string;
  signature: string;
};

export type OutreachDraft = {
  id: string;
  leadIndex: number;
  lead: Lead;
  subject: string;
  greeting: string;
  introduction: string;
  offer: string;
  callToAction: string;
  signature: string;
  body: string;
  status: EmailSendStatus;
  approved: boolean;
  aiReviewNotes: string;
  needsFix: boolean;
  suggestedSubject: string;
  suggestedBody: string;
  error: string;
  sentAt: string;
};

export type SendLogEntry = {
  id: string;
  recipient: string;
  subject: string;
  time: string;
  status: EmailSendStatus;
  error: string;
};

export type AttachmentPayload = {
  filename: string;
  mimeType: string;
  contentBase64: string;
};

export type GmailStatus = {
  connected: boolean;
  email: string | null;
};
