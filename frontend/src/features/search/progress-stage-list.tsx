import { cn } from "@/lib/utils";
import type { ProgressStage } from "@/types/progress";
import { Check, Circle, Loader2 } from "lucide-react";

type ProgressStageListProps = {
  stages: ProgressStage[];
};

/**
 * ProgressStageList
 * Purpose: vertical checklist of AI pipeline stages.
 */
export function ProgressStageList({ stages }: ProgressStageListProps) {
  return (
    <ol className="space-y-3">
      {stages.map((stage, index) => {
        const isActive = stage.status === "active";
        const isDone = stage.status === "done";

        return (
          <li
            key={stage.id}
            className={cn(
              "flex gap-3 rounded-xl border px-4 py-3 transition-colors",
              isActive && "border-blue-400/30 bg-blue-500/10",
              isDone && "border-border/50 bg-secondary/30",
              !isActive && !isDone && "border-border/40 bg-card/40 opacity-70"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isDone ? (
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="size-3.5" />
                </div>
              ) : isActive ? (
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                  <Loader2 className="size-3.5 animate-spin" />
                </div>
              ) : (
                <div className="flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Circle className="size-3.5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {stage.label}
                </p>
                {isActive ? (
                  <span className="text-[10px] font-medium tracking-wide text-blue-300 uppercase">
                    Live
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stage.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
