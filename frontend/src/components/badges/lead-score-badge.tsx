import { cn } from "@/lib/utils";
import { statusPillBase } from "@/lib/ui-classes";

type LeadScoreBadgeProps = {
  score: number;
  className?: string;
};

/**
 * LeadScoreBadge
 * Purpose: show AI match score at a glance.
 */
export function LeadScoreBadge({ score, className }: LeadScoreBadgeProps) {
  const tone =
    score >= 85
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25"
      : score >= 70
        ? "bg-sky-500/15 text-sky-300 ring-sky-500/25"
        : "bg-zinc-500/15 text-zinc-300 ring-zinc-500/25";

  return (
    <span
      className={cn(statusPillBase, "tabular-nums", tone, className)}
    >
      {score}
    </span>
  );
}
