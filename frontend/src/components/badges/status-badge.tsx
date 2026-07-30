import { cn } from "@/lib/utils";
import { statusPillBase } from "@/lib/ui-classes";
import type { LeadStatus } from "@/types/lead";
import type { SearchRunStatus } from "@/types/search";

type StatusBadgeProps = {
  status: LeadStatus | SearchRunStatus;
  className?: string;
};

const labels: Record<LeadStatus | SearchRunStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  archived: "Archived",
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  partial: "Partial",
};

const styles: Record<LeadStatus | SearchRunStatus, string> = {
  new: "bg-sky-500/15 text-sky-300 ring-sky-500/25",
  contacted: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  qualified: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  archived: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/25",
  queued: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/25",
  running: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  failed: "bg-red-500/15 text-red-300 ring-red-500/25",
  partial: "bg-orange-500/15 text-orange-300 ring-orange-500/25",
};

/**
 * StatusBadge
 * Purpose: show a lead or search status as a small colored pill.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusPillBase, styles[status], className)}>
      {labels[status]}
    </span>
  );
}
