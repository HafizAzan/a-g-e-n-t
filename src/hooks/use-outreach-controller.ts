"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/providers/app-state";
import type {
  OutreachDraft,
  SendLogEntry,
} from "@/types/outreach";

const DELAY_MS = 1200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useOutreachController() {
  const { drafts, setDrafts, attachments } = useAppState();
  const [reviewing, setReviewing] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState({ sent: 0, failed: 0 });
  const [logs, setLogs] = useState<SendLogEntry[]>([]);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    recipient: "",
    sent: 0,
    failed: 0,
    remaining: 0,
    estimatedSeconds: 0,
  });
  const cancelRef = useRef(false);

  function updateDraft(next: OutreachDraft) {
    setDrafts(drafts.map((d) => (d.id === next.id ? next : d)));
  }

  async function reviewAll() {
    setReviewing(true);
    setError(null);
    try {
      const res = await fetch("/api/emails/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drafts: drafts.map((d) => ({
            id: d.id,
            subject: d.subject,
            body: d.body,
            lead: d.lead,
          })),
        }),
      });
      const data = (await res.json()) as {
        reviews?: Array<{
          id: string;
          reviewNotes: string;
          needsFix?: boolean;
          suggestedSubject?: string;
          suggestedBody?: string;
        }>;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "AI review failed.");

      const byId = new Map((data.reviews || []).map((r) => [r.id, r]));
      setDrafts(
        drafts.map((draft) => {
          const review = byId.get(draft.id);
          if (!review) return draft;
          const needsFix =
            review.needsFix === true ||
            Boolean(review.suggestedSubject || review.suggestedBody);
          return {
            ...draft,
            aiReviewNotes: review.reviewNotes,
            needsFix,
            suggestedSubject: review.suggestedSubject || "",
            suggestedBody: review.suggestedBody || "",
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setReviewing(false);
    }
  }

  async function fixDraft(draft: OutreachDraft) {
    setFixingId(draft.id);
    setError(null);
    try {
      const res = await fetch("/api/emails/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: draft.suggestedSubject || draft.subject,
          body: draft.suggestedBody || draft.body,
          greeting: draft.greeting,
          introduction: draft.introduction,
          offer: draft.offer,
          callToAction: draft.callToAction,
          signature: draft.signature,
          reviewNotes: draft.aiReviewNotes,
          lead: draft.lead,
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
      if (!res.ok) throw new Error(data.error || "AI fix failed.");
      if (!data.email) throw new Error("AI fix returned empty email.");

      updateDraft({
        ...draft,
        subject: data.email.subject,
        greeting: data.email.greeting,
        introduction: data.email.introduction,
        offer: data.email.offer,
        callToAction: data.email.callToAction,
        signature: data.email.signature,
        body: data.email.body,
        needsFix: false,
        suggestedSubject: "",
        suggestedBody: "",
        aiReviewNotes: "Fixed by AI based on review notes.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fix failed.");
    } finally {
      setFixingId(null);
    }
  }

  function approveAll() {
    setDrafts(
      drafts.map((d) =>
        d.status === "skipped"
          ? d
          : {
              ...d,
              approved: true,
              status: d.status === "sent" ? "sent" : "approved",
            }
      )
    );
  }

  async function sendQueue(queue: OutreachDraft[]) {
    cancelRef.current = false;
    setProgressOpen(true);
    setResultOpen(false);

    let sent = 0;
    let failed = 0;
    let working = [...drafts];

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) {
        working = working.map((d) =>
          queue.slice(i).some((q) => q.id === d.id) &&
          d.status !== "sent" &&
          d.status !== "failed"
            ? { ...d, status: "skipped", approved: false }
            : d
        );
        break;
      }

      const item = queue[i];
      const remaining = queue.length - i;
      setProgress({
        current: i,
        total: queue.length,
        recipient: item.lead.email || item.lead.businessName,
        sent,
        failed,
        remaining,
        estimatedSeconds: Math.round((remaining * DELAY_MS) / 1000),
      });

      working = working.map((d) =>
        d.id === item.id ? { ...d, status: "sending", error: "" } : d
      );
      setDrafts(working);

      if (!item.lead.email) {
        failed += 1;
        const message = "Lead has no email address.";
        working = working.map((d) =>
          d.id === item.id ? { ...d, status: "failed", error: message } : d
        );
        setDrafts(working);
        setLogs((prev) => [
          {
            id: makeId(),
            recipient: item.lead.businessName,
            subject: item.subject,
            time: new Date().toLocaleString(),
            status: "failed",
            error: message,
          },
          ...prev,
        ]);
      } else {
        try {
          const res = await fetch("/api/gmail/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: item.lead.email,
              subject: item.subject,
              body: item.body,
              attachments,
            }),
          });
          const data = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(data.error || "Send failed.");

          sent += 1;
          working = working.map((d) =>
            d.id === item.id
              ? {
                  ...d,
                  status: "sent",
                  error: "",
                  sentAt: new Date().toISOString(),
                }
              : d
          );
          setDrafts(working);
          setLogs((prev) => [
            {
              id: makeId(),
              recipient: item.lead.email,
              subject: item.subject,
              time: new Date().toLocaleString(),
              status: "sent",
              error: "",
            },
            ...prev,
          ]);
        } catch (err) {
          failed += 1;
          const message =
            err instanceof Error ? err.message : "Failed to send email.";
          working = working.map((d) =>
            d.id === item.id ? { ...d, status: "failed", error: message } : d
          );
          setDrafts(working);
          setLogs((prev) => [
            {
              id: makeId(),
              recipient: item.lead.email,
              subject: item.subject,
              time: new Date().toLocaleString(),
              status: "failed",
              error: message,
            },
            ...prev,
          ]);
        }
      }

      setProgress((prev) => ({
        ...prev,
        current: i + 1,
        sent,
        failed,
        remaining: Math.max(queue.length - (i + 1), 0),
        estimatedSeconds: Math.round(
          (Math.max(queue.length - (i + 1), 0) * DELAY_MS) / 1000
        ),
      }));

      if (i < queue.length - 1 && !cancelRef.current) {
        await sleep(DELAY_MS);
      }
    }

    setProgressOpen(false);
    setResult({ sent, failed });
    setResultOpen(true);
  }

  function startSendApproved() {
    const queue = drafts.filter(
      (d) => d.approved && d.status !== "sent" && d.status !== "skipped"
    );
    void sendQueue(queue);
  }

  return {
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
    logs,
    progress,
    cancelRef,
    makeId,
    reviewAll,
    fixDraft,
    approveAll,
    sendQueue,
    startSendApproved,
  };
}
