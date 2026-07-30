import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProgressStage } from "@/types/progress";

type ProgressOverviewProps = {
  percent: number;
  currentStage: ProgressStage;
  estimatedSecondsLeft: number;
  elapsedSeconds: number;
  isComplete: boolean;
  isCancelled: boolean;
};

/**
 * Formats seconds as m:ss for ETA display.
 */
function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * ProgressOverview
 * Purpose: hero card with current stage, progress bar, and ETA.
 */
export function ProgressOverview({
  percent,
  currentStage,
  estimatedSecondsLeft,
  elapsedSeconds,
  isComplete,
  isCancelled,
}: ProgressOverviewProps) {
  const statusLabel = isCancelled
    ? "Cancelled"
    : isComplete
      ? "Complete"
      : "Running";

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-blue-500/10">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription>Current stage</CardDescription>
            <CardTitle className="text-xl md:text-2xl">
              {currentStage.label}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentStage.description}
            </p>
          </div>

          <div className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-medium">
            {statusLabel}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {percent}%
            </p>
            <div className="text-right text-xs text-muted-foreground">
              <p>
                Elapsed{" "}
                <span className="font-medium text-foreground">
                  {formatDuration(elapsedSeconds)}
                </span>
              </p>
              <p>
                Est. remaining{" "}
                <span className="font-medium text-foreground">
                  {isCancelled || isComplete
                    ? "0:00"
                    : formatDuration(estimatedSecondsLeft)}
                </span>
              </p>
            </div>
          </div>

          <Progress value={percent} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
}
