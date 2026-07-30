import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ProgressLog } from "@/types/progress";

type LiveLogsProps = {
  logs: ProgressLog[];
};

/**
 * LiveLogs
 * Purpose: streaming-style log feed like modern AI tools.
 * Newest logs appear at the top.
 */
export function LiveLogs({ logs }: LiveLogsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-[#0b0d10]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <p className="text-xs font-medium tracking-wide text-zinc-300 uppercase">
          Live logs
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Streaming
        </span>
      </div>

      <ScrollArea className="h-56">
        <div className="space-y-0 px-3 py-2 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="px-1 py-6 text-center text-zinc-500">
              Waiting for agent output…
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 border-b border-white/5 px-1 py-2 last:border-0"
              >
                <span className="shrink-0 text-zinc-500">{log.time}</span>
                <span
                  className={cn(
                    "leading-relaxed",
                    log.level === "success" && "text-emerald-300",
                    log.level === "warning" && "text-amber-300",
                    log.level === "info" && "text-zinc-300"
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
