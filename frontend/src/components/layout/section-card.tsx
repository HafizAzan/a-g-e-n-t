import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cardSurface } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Soft danger styling for destructive settings */
  tone?: "default" | "danger";
};

/**
 * SectionCard
 * Purpose: shared card wrapper for Settings + Lead Details (+ similar sections).
 * Replaces the near-duplicate DetailSectionCard / SettingsSectionCard.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  tone = "default",
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        cardSurface,
        tone === "danger" && "border-red-500/25 bg-red-500/5",
        className
      )}
    >
      <CardHeader
        className={cn(action && "flex flex-row items-start justify-between gap-3")}
      >
        <div className="space-y-1">
          <CardTitle
            className={cn("text-base", tone === "danger" && "text-red-300")}
          >
            {title}
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
