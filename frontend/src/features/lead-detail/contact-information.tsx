import { Phone } from "lucide-react";
import { CopyButton } from "@/components/actions/copy-button";
import { DetailRow } from "@/features/lead-detail/detail-row";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type ContactInformationProps = {
  lead: LeadDetail;
};

/**
 * ContactInformation
 * Purpose: phone, email, website with one-click copy.
 */
export function ContactInformation({ lead }: ContactInformationProps) {
  return (
    <DetailSectionCard
      title="Contact Information"
      description="Reach-out details from the mock enrichment pass."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Phone className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <DetailRow
        label="Phone"
        value={lead.phone}
        action={<CopyButton value={lead.phone} />}
      />
      <DetailRow
        label="Email"
        value={lead.email}
        action={<CopyButton value={lead.email} />}
      />
      <DetailRow
        label="Website"
        value={
          lead.website ? (
            <a
              href={`https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 hover:underline"
            >
              {lead.website}
            </a>
          ) : (
            "No website"
          )
        }
        action={
          lead.website ? <CopyButton value={lead.website} /> : undefined
        }
      />
    </DetailSectionCard>
  );
}
