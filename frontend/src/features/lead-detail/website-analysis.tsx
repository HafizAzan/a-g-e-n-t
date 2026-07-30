import { Globe2 } from "lucide-react";
import { WebsiteStatusBadge } from "@/components/badges/website-status-badge";
import { DetailRow } from "@/features/lead-detail/detail-row";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type WebsiteAnalysisProps = {
  lead: LeadDetail;
};

/**
 * WebsiteAnalysis
 * Purpose: mock technical website health snapshot.
 */
export function WebsiteAnalysis({ lead }: WebsiteAnalysisProps) {
  const analysis = lead.websiteAnalysis;

  return (
    <DetailSectionCard
      title="Website Analysis"
      description="Quality and health signals from the scan."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Globe2 className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <DetailRow
        label="Status"
        value={<WebsiteStatusBadge status={lead.websiteStatus} />}
      />
      <DetailRow label="Load speed" value={analysis.loadSpeed} />
      <DetailRow
        label="Mobile friendly"
        value={analysis.mobileFriendly ? "Yes" : "No"}
      />
      <DetailRow label="HTTPS" value={analysis.https ? "Enabled" : "Missing"} />
      <DetailRow label="Broken links" value={String(analysis.brokenLinks)} />
      <DetailRow label="Last checked" value={analysis.lastChecked} />
      <DetailRow label="Summary" value={analysis.summary} />
    </DetailSectionCard>
  );
}
