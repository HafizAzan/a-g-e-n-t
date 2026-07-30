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
import type { OutreachDraft } from "@/types/outreach";

type RetryDialogProps = {
  open: boolean;
  failedDrafts: OutreachDraft[];
  selectedCount: number;
  onOpenChange: (open: boolean) => void;
  onRetryFailed: () => void;
  onRetrySelected: () => void;
};

export function RetryDialog({
  open,
  failedDrafts,
  selectedCount,
  onOpenChange,
  onRetryFailed,
  onRetrySelected,
}: RetryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retry emails</DialogTitle>
          <DialogDescription>
            Failed emails keep their error message. Retry failed ones or retry
            currently selected drafts.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-48 space-y-2 overflow-auto rounded-md border border-border p-3 text-sm">
          {failedDrafts.length === 0 ? (
            <p className="text-muted-foreground">No failed emails.</p>
          ) : (
            failedDrafts.map((draft) => (
              <div key={draft.id}>
                <p className="font-medium">{draft.lead.businessName}</p>
                <p className="text-red-300">{draft.error || "Unknown error"}</p>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={selectedCount === 0}
            onClick={() => {
              onOpenChange(false);
              onRetrySelected();
            }}
          >
            Retry Selected ({selectedCount})
          </Button>
          <Button
            type="button"
            disabled={failedDrafts.length === 0}
            onClick={() => {
              onOpenChange(false);
              onRetryFailed();
            }}
          >
            Retry Failed ({failedDrafts.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
