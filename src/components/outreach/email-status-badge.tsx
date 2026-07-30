import { Badge } from "@/components/ui/badge";
import type { EmailSendStatus } from "@/types/outreach";

const LABELS: Record<EmailSendStatus, string> = {
  pending: "Pending",
  draft: "Draft",
  approved: "Approved",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  skipped: "Skipped",
};

export function EmailStatusBadge({ status }: { status: EmailSendStatus }) {
  return <Badge variant={status}>{LABELS[status]}</Badge>;
}
