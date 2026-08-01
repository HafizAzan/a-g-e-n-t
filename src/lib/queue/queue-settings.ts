import type { QueueSettings } from "@/types/queue";

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  minDelaySeconds: 60,
  maxDelaySeconds: 120,
};

export const QUEUE_SETTINGS_LIMITS = {
  minDelayFloor: 5,
  maxDelayCeiling: 600,
} as const;

const STORAGE_KEY = "ai-lead-finder-queue-settings";

export function validateQueueSettings(settings: QueueSettings): string | null {
  const min = settings.minDelaySeconds;
  const max = settings.maxDelaySeconds;

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return "Delay values must be valid numbers.";
  }

  if (min < QUEUE_SETTINGS_LIMITS.minDelayFloor) {
    return `Minimum delay cannot be less than ${QUEUE_SETTINGS_LIMITS.minDelayFloor} seconds.`;
  }

  if (max > QUEUE_SETTINGS_LIMITS.maxDelayCeiling) {
    return `Maximum delay cannot be greater than ${QUEUE_SETTINGS_LIMITS.maxDelayCeiling} seconds.`;
  }

  if (max < min) {
    return "Maximum delay must be greater than or equal to minimum delay.";
  }

  return null;
}

export function loadQueueSettings(): QueueSettings {
  if (typeof window === "undefined") return { ...DEFAULT_QUEUE_SETTINGS };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_QUEUE_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<QueueSettings>;
    const settings: QueueSettings = {
      minDelaySeconds: Number(parsed.minDelaySeconds),
      maxDelaySeconds: Number(parsed.maxDelaySeconds),
    };

    if (validateQueueSettings(settings)) {
      return { ...DEFAULT_QUEUE_SETTINGS };
    }

    return settings;
  } catch {
    return { ...DEFAULT_QUEUE_SETTINGS };
  }
}

export function saveQueueSettings(settings: QueueSettings): string | null {
  const error = validateQueueSettings(settings);
  if (error) return error;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  return null;
}

export function resetQueueSettings(): QueueSettings {
  const defaults = { ...DEFAULT_QUEUE_SETTINGS };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}
