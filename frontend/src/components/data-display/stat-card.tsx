import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cardSurface, iconWell } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  /**
   * default = Dashboard (larger number + hover)
   * compact = Progress metrics (slightly smaller, no hover)
   */
  size?: "default" | "compact";
  /** Optional extra classes for the icon well */
  iconClassName?: string;
};

/**
 * StatCard
 * Purpose: labeled metric tile for Dashboard and Search Progress.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  size = "default",
  iconClassName,
}: StatCardProps) {
  const isCompact = size === "compact";

  return (
    <Card
      className={cn(
        cardSurface,
        !isCompact && "transition-colors hover:bg-card",
        className
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-start justify-between gap-3 space-y-0",
          isCompact && "pb-2"
        )}
      >
        <div className={cn(!isCompact && "space-y-1")}>
          <CardDescription>{label}</CardDescription>
          <CardTitle
            className={cn(
              "font-semibold tabular-nums",
              isCompact
                ? "mt-1 text-2xl"
                : "text-3xl tracking-tight"
            )}
          >
            {value}
          </CardTitle>
        </div>
        {Icon ? (
          <div className={cn(iconWell, iconClassName)}>
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        ) : null}
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
