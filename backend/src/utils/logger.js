/**
 * logger.js — tiny console logger (swap for pino later if needed).
 */
function stamp() {
  return new Date().toISOString();
}

export const logger = {
  info(message, extra) {
    console.log(`[INFO ] ${stamp()} ${message}`, extra ?? "");
  },
  warn(message, extra) {
    console.warn(`[WARN ] ${stamp()} ${message}`, extra ?? "");
  },
  error(message, extra) {
    console.error(`[ERROR] ${stamp()} ${message}`, extra ?? "");
  },
};
