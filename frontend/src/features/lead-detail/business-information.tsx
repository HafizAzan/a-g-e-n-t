import { Building2 } from "lucide-react";
import { DetailRow } from "@/features/lead-detail/detail-row";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type BusinessInformationProps = {
  lead: LeadDetail;
};

/**
 * BusinessInformation
 * Purpose: name, category, address, and short description.
 */
export function BusinessInformation({ lead }: BusinessInformationProps) {
  return (
    <DetailSectionCard
      title="Business Information"
      description="Who they are and where they operate."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Building2 className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <DetailRow label="Business" value={lead.business} />
      <DetailRow label="Category" value={lead.category} />
      <DetailRow label="Address" value={lead.address} />
      <DetailRow
        label="Location"
        value={[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}
      />
      <DetailRow label="About" value={lead.description} />
    </DetailSectionCard>
  );
}
