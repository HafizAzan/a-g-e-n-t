import { cn } from "@/lib/utils";

type LabelValueRowProps = {
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  /**
   * stacked = label above value (Lead Details)
   * inline = label left, value right (Search Summary)
   */
  layout?: "stacked" | "inline";
};

/**
 * LabelValueRow
 * Purpose: reusable label / value row for detail cards and summaries.
 */
export function LabelValueRow({
  label,
  value,
  action,
  className,
  layout = "stacked",
}: LabelValueRowProps) {
  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0",
          className
        )}
      >
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="text-right font-medium text-foreground">{value}</dd>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/40 py-3 first:pt-0 last:border-0 last:pb-0",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium break-words text-foreground">
          {value}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
