import type { OutreachDraft } from "@/types/outreach";
import type { QueueSettings, QueueStatus } from "@/types/queue";
import {
  DEFAULT_QUEUE_SETTINGS,
  loadQueueSettings,
} from "@/lib/queue/queue-settings";
import {
  getEmailSkipReason,
  normalizeEmail,
} from "@/lib/utils/email-validation";

export function randomDelayMs(
  settings: QueueSettings = DEFAULT_QUEUE_SETTINGS
): number {
  const minMs = settings.minDelaySeconds * 1000;
  const maxMs = settings.maxDelaySeconds * 1000;
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

export function formatEtaSeconds(totalMs: number): number {
  return Math.max(0, Math.round(totalMs / 1000));
}

export function estimateRemainingMs(
  remainingCount: number,
  settings: QueueSettings = DEFAULT_QUEUE_SETTINGS
): number {
  const avgDelaySeconds =
    (settings.minDelaySeconds + settings.maxDelaySeconds) / 2;
  return remainingCount * avgDelaySeconds * 1000;
}

export function getQueueStatus(
  phase: "idle" | "sending" | "waiting",
  paused: boolean
): QueueStatus {
  if (paused && phase !== "idle") return "paused";
  return phase;
}

export function formatQueueStatusLabel(status: QueueStatus): string {
  switch (status) {
    case "sending":
      return "Sending";
    case "waiting":
      return "Waiting";
    case "paused":
      return "Paused";
    default:
      return "Idle";
  }
}

export type QueueBuildResult = {
  queue: OutreachDraft[];
  skipped: Array<{ draft: OutreachDraft; reason: string }>;
};

/**
 * Build a send queue with safety rules applied:
 * - skip empty/invalid emails
 * - skip duplicate email addresses (first wins)
 * - skip businesses already sent in this session
 */
export function buildSafeSendQueue(
  drafts: OutreachDraft[],
  sessionSentEmails: Set<string>,
  sessionSentBusinessKeys: Set<string>
): QueueBuildResult {
  const seenEmails = new Set<string>();
  const queue: OutreachDraft[] = [];
  const skipped: Array<{ draft: OutreachDraft; reason: string }> = [];

  for (const draft of drafts) {
    const email = draft.lead.email || "";
    const skipReason = getEmailSkipReason(email);

    if (skipReason) {
      skipped.push({ draft, reason: skipReason });
      continue;
    }

    const normalized = normalizeEmail(email);
    if (seenEmails.has(normalized)) {
      skipped.push({ draft, reason: "Duplicate email address in queue." });
      continue;
    }

    if (sessionSentEmails.has(normalized)) {
      skipped.push({
        draft,
        reason: "Already sent to this email in this session.",
      });
      continue;
    }

    const businessKey = `${draft.lead.businessName.trim().toLowerCase()}::${draft.lead.city.trim().toLowerCase()}`;
    if (sessionSentBusinessKeys.has(businessKey)) {
      skipped.push({
        draft,
        reason: "Already sent to this business in this session.",
      });
      continue;
    }

    seenEmails.add(normalized);
    queue.push(draft);
  }

  return { queue, skipped };
}

/** Load saved queue settings (client-side). Falls back to defaults on the server. */
export function getActiveQueueSettings(): QueueSettings {
  return loadQueueSettings();
}

export async function sleepWithCountdown(
  totalMs: number,
  onTick: (secondsLeft: number) => void,
  signal: { cancelled: () => boolean; paused: () => boolean }
) {
  let elapsed = 0;
  onTick(Math.ceil((totalMs - elapsed) / 1000));

  while (elapsed < totalMs) {
    if (signal.cancelled()) return;

    while (signal.paused()) {
      await new Promise((r) => setTimeout(r, 300));
      if (signal.cancelled()) return;
    }

    await new Promise((r) => setTimeout(r, 1000));
    elapsed += 1000;
    onTick(Math.max(0, Math.ceil((totalMs - elapsed) / 1000)));
  }
}
