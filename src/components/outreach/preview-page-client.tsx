"use client";

import { BulkPreviewView } from "@/components/outreach/bulk-preview-view";
import { SendingProgressDialog } from "@/components/outreach/sending-progress-dialog";
import { SendResultDialog } from "@/components/outreach/send-result-dialog";
import { useOutreachController } from "@/hooks/use-outreach-controller";

export function PreviewPageClient() {
  const {
    reviewing,
    fixingId,
    error,
    confirmOpen,
    setConfirmOpen,
    progressOpen,
    resultOpen,
    setResultOpen,
    result,
    progress,
    cancelRef,
    reviewAll,
    fixDraft,
    approveAll,
    startSendApproved,
  } = useOutreachController();

  return (
    <>
      {error ? (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:px-6">
          {error}
        </div>
      ) : null}

      <BulkPreviewView
        reviewing={reviewing}
        fixingId={fixingId}
        onReviewAll={() => void reviewAll()}
        onApproveAll={approveAll}
        onFixDraft={(draft) => void fixDraft(draft)}
        onRequestSend={() => setConfirmOpen(true)}
        confirmOpen={confirmOpen}
        onConfirmOpenChange={setConfirmOpen}
        onConfirmSend={startSendApproved}
      />

      <SendingProgressDialog
        open={progressOpen}
        current={progress.current}
        total={progress.total}
        recipient={progress.recipient}
        sent={progress.sent}
        failed={progress.failed}
        remaining={progress.remaining}
        estimatedSeconds={progress.estimatedSeconds}
        onCancel={() => {
          cancelRef.current = true;
        }}
      />

      <SendResultDialog
        open={resultOpen}
        kind={
          result.failed === 0
            ? "success"
            : result.sent === 0
              ? "failed"
              : "mixed"
        }
        sent={result.sent}
        failed={result.failed}
        onOpenChange={setResultOpen}
        onRetryFailed={() => setConfirmOpen(true)}
      />
    </>
  );
}
