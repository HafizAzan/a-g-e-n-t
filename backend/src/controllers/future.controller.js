/**
 * future.controller.js — stubs for later endpoints (501).
 */
import { AppError } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/errorHandler.js";

function notImplemented(feature) {
  return asyncHandler(async () => {
    throw new AppError(
      `${feature} is not implemented yet`,
      501,
      "NOT_IMPLEMENTED"
    );
  });
}

export const analyzeLead = notImplemented("POST /api/analyze/:leadId");
export const reanalyze = notImplemented("POST /api/reanalyze");
export const findContacts = notImplemented("POST /api/find-contacts");
