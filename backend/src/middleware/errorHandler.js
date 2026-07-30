/**
 * errorHandler.js — final Express error middleware (4 args required).
 */
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  logger.error(`${req.method} ${req.originalUrl} → ${status}`, message);

  res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || undefined,
      details: err.details || undefined,
      ...(env.nodeEnv === "development" && err.stack
        ? { stack: err.stack }
        : {}),
    },
  });
}

/**
 * Wrap async route handlers so rejected promises hit errorHandler.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
