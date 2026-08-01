export type QueueSettings = {
  minDelaySeconds: number;
  maxDelaySeconds: number;
};

export type QueuePhase = "idle" | "sending" | "waiting";

export type QueueStatus = "idle" | "sending" | "waiting" | "paused";
