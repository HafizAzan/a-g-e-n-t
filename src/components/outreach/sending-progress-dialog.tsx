"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatQueueStatusLabel } from "@/lib/queue";
import type { QueueStatus } from "@/types/queue";

type SendingProgressDialogProps = {
  open: boolean;
  current: number;
  total: number;
  recipient: string;
  businessName: string;
  phase: "idle" | "sending" | "waiting";
  queueStatus: QueueStatus;
  currentDelaySeconds: number;
  countdownSeconds: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  sent: number;
  failed: number;
  skipped: number;
  remaining: number;
  estimatedSeconds: number;
  paused: boolean;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
};

export function SendingProgressDialog({
  open,
  current,
  total,
  recipient,
  businessName,
  phase,
  queueStatus,
  currentDelaySeconds,
  countdownSeconds,
  minDelaySeconds,
  maxDelaySeconds,
  sent,
  failed,
  skipped,
  remaining,
  estimatedSeconds,
  paused,
  onCancel,
  onPause,
  onResume,
}: SendingProgressDialogProps) {
  const displayCurrent = total === 0 ? 0 : Math.min(current + 1, total);
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  const statusLabel = formatQueueStatusLabel(queueStatus);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {phase === "waiting"
              ? `Waiting before email ${displayCurrent} of ${total}...`
              : `Sending ${displayCurrent} of ${total}...`}
          </DialogTitle>
          <DialogDescription>
            Emails are sent one at a time with a random {minDelaySeconds}–
            {maxDelaySeconds} second delay between each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Queue status</p>
              <Badge
                variant={
                  queueStatus === "paused"
                    ? "pending"
                    : queueStatus === "waiting"
                      ? "waiting"
                      : queueStatus === "sending"
                        ? "sending"
                        : "draft"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            {phase === "waiting" && currentDelaySeconds > 0 ? (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current delay</p>
                <p className="font-medium tabular-nums">{currentDelaySeconds}s</p>
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Current recipient</p>
            <p className="font-medium">{recipient || "—"}</p>
            {businessName ? (
              <p className="text-sm text-muted-foreground">{businessName}</p>
            ) : null}
          </div>

          {phase === "waiting" ? (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center">
              <p className="text-sm text-yellow-200">Countdown</p>
              <p className="text-3xl font-semibold tabular-nums text-yellow-100">
                {countdownSeconds}s
              </p>
              {paused ? (
                <p className="mt-1 text-xs text-yellow-300/80">
                  Queue paused — countdown will resume when you continue
                </p>
              ) : null}
            </div>
          ) : null}

          <Progress value={percent} />

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            <div>
              <p className="text-muted-foreground">Sent</p>
              <p className="font-medium text-green-300">{sent}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed</p>
              <p className="font-medium text-red-300">{failed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Skipped</p>
              <p className="font-medium text-orange-300">{skipped}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-medium">{remaining}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ETA</p>
              <p className="font-medium">~{estimatedSeconds}s</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {paused ? (
            <Button type="button" variant="secondary" onClick={onResume}>
              Resume Queue
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={onPause}>
              Pause Queue
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
