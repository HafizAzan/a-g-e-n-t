"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectGmailCard } from "@/components/outreach/connect-gmail-card";
import { EmailComposer } from "@/components/outreach/email-composer";
import { BulkActions, SendLogList } from "@/components/outreach/bulk-actions";
import { ConfirmSendDialog } from "@/components/outreach/confirm-send-dialog";
import { SendingProgressDialog } from "@/components/outreach/sending-progress-dialog";
import { RetryDialog } from "@/components/outreach/retry-dialog";
import { SendResultDialog } from "@/components/outreach/send-result-dialog";
import { useOutreachController } from "@/hooks/use-outreach-controller";
import { useAppState } from "@/providers/app-state";
import type { EmailTemplate, OutreachDraft } from "@/types/outreach";

export function OutreachPanel() {
  const router = useRouter();
  const {
    leads,
    selectedIndexes,
    setSelectedIndexes,
    drafts,
    setDrafts,
    setAttachments,
  } = useAppState();

  const {
    reviewing,
    error,
    setError,
    confirmOpen,
    setConfirmOpen,
    progressOpen,
    resultOpen,
    setResultOpen,
    result,
    logs,
    progress,
    cancelRef,
    makeId,
    sendQueue,
    startSendApproved,
  } = useOutreachController();

  const [generating, setGenerating] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);

  const approvedCount = drafts.filter(
    (d) => d.approved && d.status !== "skipped"
  ).length;
  const failedDrafts = drafts.filter((d) => d.status === "failed");

  async function handleGenerate(input: {
    template: EmailTemplate;
    senderName: string;
  }) {
    setGenerating(true);
    setError(null);
    try {
      const selectedLeads = selectedIndexes.map((leadIndex) => ({
        ...leads[leadIndex],
        leadIndex,
      }));

      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: selectedLeads,
          template: input.template,
          senderName: input.senderName,
        }),
      });
      const data = (await res.json()) as {
        emails?: Array<{
          leadIndex: number;
          subject: string;
          greeting: string;
          introduction: string;
          offer: string;
          callToAction: string;
          signature: string;
          body: string;
        }>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed to generate emails.");

      const nextDrafts: OutreachDraft[] = (data.emails || []).map((email) => {
        const lead = leads[email.leadIndex];
        return {
          id: makeId(),
          leadIndex: email.leadIndex,
          lead,
          subject: email.subject,
          greeting: email.greeting,
          introduction: email.introduction,
          offer: email.offer,
          callToAction: email.callToAction,
          signature: email.signature,
          body: email.body,
          status: "draft",
          approved: false,
          aiReviewNotes: "",
          needsFix: false,
          suggestedSubject: "",
          suggestedBody: "",
          error: "",
          sentAt: "",
        };
      });

      setDrafts(nextDrafts);
      router.push("/preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed.");
    } finally {
      setGenerating(false);
    }
  }

  function retryFailed() {
    const queue = drafts.filter((d) => d.status === "failed");
    setDrafts(
      drafts.map((d) =>
        d.status === "failed"
          ? { ...d, approved: true, status: "approved", error: d.error }
          : d
      )
    );
    void sendQueue(
      queue.map((d) => ({ ...d, approved: true, status: "approved" }))
    );
  }

  function retrySelected() {
    const selectedSet = new Set(selectedIndexes);
    const queue = drafts.filter((d) => selectedSet.has(d.leadIndex));
    void sendQueue(queue);
  }

  return (
    <div className="space-y-6">
      <ConnectGmailCard />

      <EmailComposer
        selectedCount={selectedIndexes.length}
        generating={generating}
        reviewing={reviewing}
        onGenerate={handleGenerate}
        onAttachmentsChange={setAttachments}
      />

      <BulkActions
        selectedCount={selectedIndexes.length}
        draftCount={drafts.length}
        approvedCount={approvedCount}
        failedCount={failedDrafts.length}
        onSelectAll={() =>
          setSelectedIndexes(leads.map((_, index) => index))
        }
        onClearSelection={() => setSelectedIndexes([])}
        onOpenPreview={() => router.push("/preview")}
        onOpenRetry={() => setRetryOpen(true)}
      />

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <SendLogList logs={logs} />

      <ConfirmSendDialog
        open={confirmOpen}
        count={approvedCount}
        onOpenChange={setConfirmOpen}
        onConfirm={startSendApproved}
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

      <RetryDialog
        open={retryOpen}
        failedDrafts={failedDrafts}
        selectedCount={selectedIndexes.length}
        onOpenChange={setRetryOpen}
        onRetryFailed={retryFailed}
        onRetrySelected={retrySelected}
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
        onRetryFailed={retryFailed}
      />
    </div>
  );
}
