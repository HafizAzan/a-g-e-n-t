"use client";

import { Button } from "@/components/ui/button";
import type { SendLogEntry } from "@/types/outreach";
import { EmailStatusBadge } from "@/components/outreach/email-status-badge";

type BulkActionsProps = {
  selectedCount: number;
  draftCount: number;
  approvedCount: number;
  failedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenPreview: () => void;
  onOpenRetry: () => void;
};

export function BulkActions({
  selectedCount,
  draftCount,
  approvedCount,
  failedCount,
  onSelectAll,
  onClearSelection,
  onOpenPreview,
  onOpenRetry,
}: BulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onSelectAll}>
        Select All
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
        Clear
      </Button>
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <Button
        type="button"
        size="sm"
        disabled={draftCount === 0}
        onClick={onOpenPreview}
      >
        Bulk Preview All ({draftCount})
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={approvedCount === 0}
        onClick={onOpenPreview}
      >
        Approved ready ({approvedCount})
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={failedCount === 0}
        onClick={onOpenRetry}
      >
        Retry ({failedCount})
      </Button>
    </div>
  );
}

export function SendLogList({ logs }: { logs: SendLogEntry[] }) {
  if (logs.length === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card/40 p-5">
      <h2 className="text-lg font-medium">Session send log</h2>
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{log.recipient}</p>
              <p className="text-muted-foreground">{log.businessName}</p>
              <p className="text-muted-foreground">{log.subject}</p>
              {log.delayUsedMs ? (
                <p className="text-xs text-muted-foreground">
                  Delay before send: {Math.round(log.delayUsedMs / 1000)}s
                </p>
              ) : null}
              {log.error ? (
                <p className="text-red-300">{log.error}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{log.time}</span>
              <EmailStatusBadge status={log.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
