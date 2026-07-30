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

type ResultScreenProps = {
  open: boolean;
  kind: "success" | "failed" | "mixed";
  sent: number;
  failed: number;
  onOpenChange: (open: boolean) => void;
  onRetryFailed: () => void;
};

export function SendResultDialog({
  open,
  kind,
  sent,
  failed,
  onOpenChange,
  onRetryFailed,
}: ResultScreenProps) {
  const title =
    kind === "success"
      ? "All emails sent"
      : kind === "failed"
        ? "Sending failed"
        : "Sending finished with issues";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Sent: {sent}. Failed: {failed}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {failed > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                onRetryFailed();
              }}
            >
              Retry Failed
            </Button>
          ) : null}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
