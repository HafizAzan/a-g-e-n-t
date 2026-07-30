/** Config stub for later Cursor wiring. */
import { env } from "./env.js";

export function getCursorConfig() {
  return {
    apiKey: env.cursorApiKey,
    configured: Boolean(env.cursorApiKey),
    modelId: process.env.CURSOR_MODEL || "composer-2.5",
  };
}
