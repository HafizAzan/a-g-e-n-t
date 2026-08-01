"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/providers/app-state";
import {
  buildSafeSendQueue,
  estimateRemainingMs,
  formatEtaSeconds,
  getActiveQueueSettings,
  getQueueStatus,
  randomDelayMs,
  sleepWithCountdown,
} from "@/lib/queue";
import { normalizeEmail } from "@/lib/utils/email-validation";
import type { OutreachDraft, SendLogEntry } from "@/types/outreach";
import type { QueueSettings, QueueStatus } from "@/types/queue";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function businessKey(draft: OutreachDraft) {
  return `${draft.lead.businessName.trim().toLowerCase()}::${draft.lead.city.trim().toLowerCase()}`;
}

export function useOutreachController() {
  const { drafts, setDrafts, attachments } = useAppState();
  const [reviewing, setReviewing] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState({ sent: 0, failed: 0, skipped: 0 });
  const [logs, setLogs] = useState<SendLogEntry[]>([]);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    recipient: "",
    businessName: "",
    phase: "idle" as "idle" | "sending" | "waiting",
    queueStatus: "idle" as QueueStatus,
    currentDelaySeconds: 0,
    countdownSeconds: 0,
    minDelaySeconds: 60,
    maxDelaySeconds: 120,
    sent: 0,
    failed: 0,
    skipped: 0,
    remaining: 0,
    estimatedSeconds: 0,
    paused: false,
  });

  const cancelRef = useRef(false);
  const pauseRef = useRef(false);
  const sessionSentEmailsRef = useRef(new Set<string>());
  const sessionSentBusinessRef = useRef(new Set<string>());

  function updateDraft(next: OutreachDraft) {
    setDrafts(drafts.map((d) => (d.id === next.id ? next : d)));
  }

  function appendLog(entry: Omit<SendLogEntry, "id">) {
    setLogs((prev) => [{ id: makeId(), ...entry }, ...prev]);
  }

  function setProgressState(
    patch: Partial<typeof progress> & {
      phase?: "idle" | "sending" | "waiting";
      paused?: boolean;
    }
  ) {
    setProgress((prev) => {
      const next = { ...prev, ...patch };
      const phase = next.phase;
      const paused = next.paused;
      return {
        ...next,
        queueStatus: getQueueStatus(phase, paused),
      };
    });
  }

  async function fetchDefaultAccountId(): Promise<string | undefined> {
    const res = await fetch("/api/gmail/status");
    const data = (await res.json()) as {
      defaultAccountId?: string | null;
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || "Failed to load Gmail account.");
    return data.defaultAccountId || undefined;
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

  function pauseQueue() {
    pauseRef.current = true;
    setProgressState({ paused: true });
  }

  function resumeQueue() {
    pauseRef.current = false;
    setProgressState({ paused: false });
  }

  async function sendQueue(inputQueue: OutreachDraft[]) {
    const queueSettings: QueueSettings = getActiveQueueSettings();

    cancelRef.current = false;
    pauseRef.current = false;
    setProgressOpen(true);
    setResultOpen(false);

    const { queue, skipped: preSkipped } = buildSafeSendQueue(
      inputQueue,
      sessionSentEmailsRef.current,
      sessionSentBusinessRef.current
    );

    let working = [...drafts];
    let sent = 0;
    let failed = 0;
    let skipped = preSkipped.length;

    for (const { draft, reason } of preSkipped) {
      working = working.map((d) =>
        d.id === draft.id
          ? { ...d, status: "skipped", approved: false, error: reason }
          : d
      );
      appendLog({
        recipient: draft.lead.email || draft.lead.businessName,
        businessName: draft.lead.businessName,
        subject: draft.subject,
        time: new Date().toLocaleString(),
        status: "skipped",
        error: reason,
        delayUsedMs: null,
      });
    }
    setDrafts(working);

    let accountId: string | undefined;
    try {
      accountId = await fetchDefaultAccountId();
      if (!accountId) {
        throw new Error("Connect a Gmail account before sending.");
      }
    } catch (err) {
      setProgressOpen(false);
      setError(err instanceof Error ? err.message : "Gmail not connected.");
      return;
    }

    let pendingDelayMs: number | null = null;

    setProgressState({
      current: 0,
      total: queue.length,
      recipient: "",
      businessName: "",
      phase: queue.length > 0 ? "sending" : "idle",
      queueStatus: queue.length > 0 ? "sending" : "idle",
      currentDelaySeconds: 0,
      countdownSeconds: 0,
      minDelaySeconds: queueSettings.minDelaySeconds,
      maxDelaySeconds: queueSettings.maxDelaySeconds,
      sent,
      failed,
      skipped,
      remaining: queue.length,
      estimatedSeconds: formatEtaSeconds(
        estimateRemainingMs(queue.length, queueSettings)
      ),
      paused: false,
    });

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) {
        working = working.map((d) =>
          queue.slice(i).some((q) => q.id === d.id) &&
          d.status !== "sent" &&
          d.status !== "failed"
            ? { ...d, status: "skipped", approved: false }
            : d
        );
        setDrafts(working);
        break;
      }

      while (pauseRef.current && !cancelRef.current) {
        setProgressState({ paused: true });
        await new Promise((r) => setTimeout(r, 300));
      }

      const item = queue[i];
      const remaining = queue.length - i;

      setProgressState({
        current: i,
        total: queue.length,
        recipient: item.lead.email || item.lead.businessName,
        businessName: item.lead.businessName,
        phase: "sending",
        currentDelaySeconds: 0,
        countdownSeconds: 0,
        sent,
        failed,
        skipped,
        remaining,
        estimatedSeconds: formatEtaSeconds(
          estimateRemainingMs(remaining, queueSettings)
        ),
        paused: pauseRef.current,
      });

      working = working.map((d) =>
        d.id === item.id ? { ...d, status: "sending", error: "" } : d
      );
      setDrafts(working);

      try {
        const res = await fetch("/api/gmail/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId,
            to: item.lead.email,
            subject: item.subject,
            body: item.body,
            attachments,
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Send failed.");

        sent += 1;
        const normalized = normalizeEmail(item.lead.email);
        sessionSentEmailsRef.current.add(normalized);
        sessionSentBusinessRef.current.add(businessKey(item));

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
        appendLog({
          recipient: item.lead.email,
          businessName: item.lead.businessName,
          subject: item.subject,
          time: new Date().toLocaleString(),
          status: "sent",
          error: "",
          delayUsedMs: pendingDelayMs,
        });
        pendingDelayMs = null;
      } catch (err) {
        failed += 1;
        const message =
          err instanceof Error ? err.message : "Failed to send email.";
        working = working.map((d) =>
          d.id === item.id ? { ...d, status: "failed", error: message } : d
        );
        setDrafts(working);
        appendLog({
          recipient: item.lead.email || item.lead.businessName,
          businessName: item.lead.businessName,
          subject: item.subject,
          time: new Date().toLocaleString(),
          status: "failed",
          error: message,
          delayUsedMs: null,
        });
      }

      setProgressState({
        current: i + 1,
        sent,
        failed,
        skipped,
        remaining: Math.max(queue.length - (i + 1), 0),
        estimatedSeconds: formatEtaSeconds(
          estimateRemainingMs(
            Math.max(queue.length - (i + 1), 0),
            queueSettings
          )
        ),
      });

      if (i < queue.length - 1 && !cancelRef.current) {
        const delayMs = randomDelayMs(queueSettings);
        const delaySeconds = Math.round(delayMs / 1000);
        pendingDelayMs = delayMs;

        working = working.map((d) =>
          d.id === queue[i + 1].id ? { ...d, status: "waiting" } : d
        );
        setDrafts(working);

        setProgressState({
          phase: "waiting",
          currentDelaySeconds: delaySeconds,
          countdownSeconds: delaySeconds,
          recipient: queue[i + 1].lead.email || queue[i + 1].lead.businessName,
          businessName: queue[i + 1].lead.businessName,
          paused: pauseRef.current,
        });

        await sleepWithCountdown(
          delayMs,
          (secondsLeft) => {
            setProgressState({
              countdownSeconds: secondsLeft,
              paused: pauseRef.current,
            });
          },
          {
            cancelled: () => cancelRef.current,
            paused: () => pauseRef.current,
          }
        );

        if (cancelRef.current) {
          working = working.map((d) =>
            queue.slice(i + 1).some((q) => q.id === d.id) &&
            d.status !== "sent" &&
            d.status !== "failed"
              ? { ...d, status: "skipped", approved: false }
              : d
          );
          setDrafts(working);
          break;
        }
      }
    }

    setProgressState({
      phase: "idle",
      queueStatus: "idle",
      paused: false,
      currentDelaySeconds: 0,
      countdownSeconds: 0,
    });
    setProgressOpen(false);
    setResult({ sent, failed, skipped });
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
    pauseQueue,
    resumeQueue,
    makeId,
    reviewAll,
    fixDraft,
    approveAll,
    sendQueue,
    startSendApproved,
  };
}
