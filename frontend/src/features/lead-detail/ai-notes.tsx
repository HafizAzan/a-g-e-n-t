import { Sparkles } from "lucide-react";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type AiNotesProps = {
  lead: LeadDetail;
};

/**
 * AiNotes
 * Purpose: short AI-generated talking points for outreach.
 */
export function AiNotes({ lead }: AiNotesProps) {
  return (
    <DetailSectionCard
      title="AI Notes"
      description="Mock insights to help you decide how to reach out."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Sparkles className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <ul className="space-y-3">
        {lead.aiNotes.map((note, index) => (
          <li
            key={note}
            className="flex gap-3 rounded-xl border border-border/50 bg-gradient-to-br from-secondary/40 to-transparent p-4"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <p className="text-sm leading-relaxed text-foreground">{note}</p>
          </li>
        ))}
      </ul>
    </DetailSectionCard>
  );
}
