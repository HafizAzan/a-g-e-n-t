"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailPreview } from "@/components/outreach/email-preview";
import { EmailStatusBadge } from "@/components/outreach/email-status-badge";
import { ConfirmSendDialog } from "@/components/outreach/confirm-send-dialog";
import { useAppState } from "@/providers/app-state";
import { cn } from "@/lib/utils";
import type { OutreachDraft } from "@/types/outreach";

type BulkPreviewViewProps = {
  reviewing: boolean;
  fixingId: string | null;
  regeneratingId: string | null;
  onReviewAll: () => void;
  onApproveAll: () => void;
  onFixDraft: (draft: OutreachDraft) => void;
  onRegenerateDraft: (draft: OutreachDraft) => void;
  onRequestSend: () => void;
  confirmOpen: boolean;
  onConfirmOpenChange: (open: boolean) => void;
  onConfirmSend: () => void;
};

export function BulkPreviewView({
  reviewing,
  fixingId,
  regeneratingId,
  onReviewAll,
  onApproveAll,
  onFixDraft,
  onRegenerateDraft,
  onRequestSend,
  confirmOpen,
  onConfirmOpenChange,
  onConfirmSend,
}: BulkPreviewViewProps) {
  const { drafts, setDrafts } = useAppState();
  const [activeId, setActiveId] = useState<string | null>(null);

  const active =
    drafts.find((d) => d.id === (activeId || drafts[0]?.id)) || drafts[0];

  const approvedCount = useMemo(
    () => drafts.filter((d) => d.approved && d.status !== "skipped").length,
    [drafts]
  );

  const needsFixCount = useMemo(
    () => drafts.filter((d) => d.needsFix).length,
    [drafts]
  );

  function updateDraft(next: OutreachDraft) {
    setDrafts(drafts.map((d) => (d.id === next.id ? next : d)));
  }

  return (
    <div className="flex h-[calc(100vh-0px)] min-h-screen flex-col">
      <div className="border-b border-border px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-7xl space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Bulk Preview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Bulk Preview All
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              AI can review every draft. If a fix is needed, use Fix — AI will
              rewrite that email. Approve each email before bulk send.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={reviewing || drafts.length === 0}
              onClick={onReviewAll}
            >
              {reviewing ? "AI reviewing..." : "AI Review All"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={drafts.length === 0}
              onClick={onApproveAll}
            >
              Approve All
            </Button>
            <Button
              type="button"
              disabled={approvedCount === 0}
              onClick={onRequestSend}
            >
              Bulk Send Approved ({approvedCount})
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {approvedCount} approved · {needsFixCount} need fix · {drafts.length}{" "}
            drafts
          </p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No drafts yet. Go to Email Outreach, select leads, and generate
            emails first.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 md:grid-cols-[260px_1fr]">
          <ScrollArea className="border-b border-border md:h-[calc(100vh-210px)] md:border-b-0 md:border-r">
            <div className="space-y-1 p-3">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => setActiveId(draft.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent",
                    active?.id === draft.id && "bg-accent"
                  )}
                >
                  <span className="truncate font-medium">
                    {draft.lead.businessName}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <EmailStatusBadge status={draft.status} />
                    {draft.needsFix ? (
                      <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                        Needs fix
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <ScrollArea className="md:h-[calc(100vh-210px)]">
            <div className="p-4 sm:p-6">
              {active ? (
                <EmailPreview
                  draft={active}
                  fixing={fixingId === active.id}
                  regenerating={regeneratingId === active.id}
                  onChange={updateDraft}
                  onFix={() => onFixDraft(active)}
                  onRegenerate={() => onRegenerateDraft(active)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No draft selected.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <ConfirmSendDialog
        open={confirmOpen}
        count={approvedCount}
        onOpenChange={onConfirmOpenChange}
        onConfirm={onConfirmSend}
      />
    </div>
  );
}
