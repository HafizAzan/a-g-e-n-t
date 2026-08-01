import type { Lead } from "@/types/lead";

export type EmailSendStatus =
  | "pending"
  | "draft"
  | "approved"
  | "generating"
  | "waiting"
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
  businessName: string;
  subject: string;
  time: string;
  status: EmailSendStatus;
  error: string;
  delayUsedMs: number | null;
};

export type AttachmentPayload = {
  filename: string;
  mimeType: string;
  contentBase64: string;
};

export type GmailAccountStatus = {
  id: string;
  email: string;
  picture: string | null;
  connected: boolean;
  isDefault: boolean;
};

export type GmailStatus = {
  connected: boolean;
  accounts: GmailAccountStatus[];
  defaultAccountId: string | null;
};
