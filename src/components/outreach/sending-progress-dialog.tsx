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

type SendingProgressDialogProps = {
  open: boolean;
  current: number;
  total: number;
  recipient: string;
  sent: number;
  failed: number;
  remaining: number;
  estimatedSeconds: number;
  onCancel: () => void;
};

export function SendingProgressDialog({
  open,
  current,
  total,
  recipient,
  sent,
  failed,
  remaining,
  estimatedSeconds,
  onCancel,
}: SendingProgressDialogProps) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            Sending {Math.min(current + 1, total)} of {total}...
          </DialogTitle>
          <DialogDescription>
            Emails are sent one by one with a short delay between each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current recipient</p>
            <p className="font-medium">{recipient || "—"}</p>
          </div>
          <Progress value={percent} />
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Sent</p>
              <p className="font-medium text-green-300">{sent}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failed</p>
              <p className="font-medium text-red-300">{failed}</p>
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
