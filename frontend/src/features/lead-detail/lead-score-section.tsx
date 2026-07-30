import { Gauge } from "lucide-react";
import { LeadScoreBadge } from "@/components/badges/lead-score-badge";
import { Progress } from "@/components/ui/progress";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type LeadScoreSectionProps = {
  lead: LeadDetail;
};

/**
 * LeadScoreSection
 * Purpose: overall score + breakdown bars.
 */
export function LeadScoreSection({ lead }: LeadScoreSectionProps) {
  return (
    <DetailSectionCard
      title="Lead Score"
      description="How strongly this business matches your search."
      action={<LeadScoreBadge score={lead.leadScore} />}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
          <Gauge className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {lead.leadScore}
            <span className="text-base font-normal text-muted-foreground">
              /100
            </span>
          </p>
          <p className="text-xs text-muted-foreground">Overall fit score</p>
        </div>
      </div>

      <div className="space-y-4">
        {lead.scoreBreakdown.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums">{item.value}</span>
            </div>
            <Progress value={item.value} className="h-2" />
          </div>
        ))}
      </div>
    </DetailSectionCard>
  );
}
