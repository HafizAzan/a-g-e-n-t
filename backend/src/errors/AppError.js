/**
 * AppError.js — typed HTTP errors for the error middleware.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {string} [code]
   * @param {unknown} [details]
   */
  constructor(message, statusCode = 500, code = "APP_ERROR", details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = "Resource not found") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function badRequest(message, details) {
  return new AppError(message, 400, "BAD_REQUEST", details);
}
