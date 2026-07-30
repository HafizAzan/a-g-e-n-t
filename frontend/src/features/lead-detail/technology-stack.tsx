import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type TechnologyStackProps = {
  lead: LeadDetail;
};

/**
 * TechnologyStack
 * Purpose: show detected (mock) tech used on the business website.
 */
export function TechnologyStack({ lead }: TechnologyStackProps) {
  return (
    <DetailSectionCard
      title="Technology Stack"
      description="Tools and platforms spotted on the site."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Cpu className="size-4 text-muted-foreground" />
        </div>
      }
    >
      {lead.technologyStack.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No technology detected (often means no website).
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {lead.technologyStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="px-2.5 py-1">
              {tech}
            </Badge>
          ))}
        </div>
      )}
    </DetailSectionCard>
  );
}
