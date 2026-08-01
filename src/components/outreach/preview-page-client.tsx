"use client";

import { useState } from "react";
import { BulkPreviewView } from "@/components/outreach/bulk-preview-view";
import { SendingProgressDialog } from "@/components/outreach/sending-progress-dialog";
import { SendResultDialog } from "@/components/outreach/send-result-dialog";
import { useOutreachController } from "@/hooks/use-outreach-controller";
import { useAppState } from "@/providers/app-state";
import type { OutreachDraft } from "@/types/outreach";

export function PreviewPageClient() {
  const { outreachTemplate, senderName, setDrafts, drafts } = useAppState();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const {
    reviewing,
    fixingId,
    error,
    setError,
    confirmOpen,
    setConfirmOpen,
    progressOpen,
    resultOpen,
    setResultOpen,
    result,
    progress,
    cancelRef,
    pauseQueue,
    resumeQueue,
    reviewAll,
    fixDraft,
    approveAll,
    startSendApproved,
  } = useOutreachController();

  async function regenerateDraft(draft: OutreachDraft) {
    if (!outreachTemplate) {
      setError("No template found. Generate emails from Email Outreach first.");
      return;
    }

    setRegeneratingId(draft.id);
    setError(null);

    setDrafts(
      drafts.map((d) =>
        d.id === draft.id ? { ...d, status: "generating" } : d
      )
    );

    try {
      const res = await fetch("/api/emails/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: { ...draft.lead, leadIndex: draft.leadIndex },
          template: outreachTemplate,
          senderName,
        }),
      });
      const data = (await res.json()) as {
        email?: {
          subject: string;
          greeting: string;
          introduction: string;
          offer: string;
          callToAction: string;
          signature: string;
          body: string;
        };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Regenerate failed.");
      if (!data.email) throw new Error("AI returned empty email.");

      setDrafts(
        drafts.map((d) =>
          d.id === draft.id
            ? {
                ...d,
                subject: data.email!.subject,
                greeting: data.email!.greeting,
                introduction: data.email!.introduction,
                offer: data.email!.offer,
                callToAction: data.email!.callToAction,
                signature: data.email!.signature,
                body: data.email!.body,
                status: "draft",
                approved: false,
                needsFix: false,
                aiReviewNotes: "",
                suggestedSubject: "",
                suggestedBody: "",
                error: "",
              }
            : d
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regenerate failed.");
      setDrafts(
        drafts.map((d) =>
          d.id === draft.id ? { ...d, status: "draft" } : d
        )
      );
    } finally {
      setRegeneratingId(null);
    }
  }

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
        regeneratingId={regeneratingId}
        onReviewAll={() => void reviewAll()}
        onApproveAll={approveAll}
        onFixDraft={(draft) => void fixDraft(draft)}
        onRegenerateDraft={(draft) => void regenerateDraft(draft)}
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
        businessName={progress.businessName}
        phase={progress.phase}
        queueStatus={progress.queueStatus}
        currentDelaySeconds={progress.currentDelaySeconds}
        countdownSeconds={progress.countdownSeconds}
        minDelaySeconds={progress.minDelaySeconds}
        maxDelaySeconds={progress.maxDelaySeconds}
        sent={progress.sent}
        failed={progress.failed}
        skipped={progress.skipped}
        remaining={progress.remaining}
        estimatedSeconds={progress.estimatedSeconds}
        paused={progress.paused}
        onCancel={() => {
          cancelRef.current = true;
        }}
        onPause={pauseQueue}
        onResume={resumeQueue}
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
        skipped={result.skipped}
        onOpenChange={setResultOpen}
        onRetryFailed={() => setConfirmOpen(true)}
      />
    </>
  );
}
