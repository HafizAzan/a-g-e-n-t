import { cn } from "@/lib/utils";
import { statusPillBase } from "@/lib/ui-classes";
import type { WebsiteStatus } from "@/types/result-lead";

type WebsiteStatusBadgeProps = {
  status: WebsiteStatus;
  className?: string;
};

const labels: Record<WebsiteStatus, string> = {
  good: "Good",
  poor: "Poor",
  none: "No website",
  unknown: "Unknown",
};

const styles: Record<WebsiteStatus, string> = {
  good: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  poor: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  none: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/25",
  unknown: "bg-sky-500/15 text-sky-300 ring-sky-500/25",
};

/**
 * WebsiteStatusBadge
 * Purpose: show website quality status in the Results table.
 */
export function WebsiteStatusBadge({
  status,
  className,
}: WebsiteStatusBadgeProps) {
  return (
    <span
      className={cn(
        statusPillBase,
        "whitespace-nowrap",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
