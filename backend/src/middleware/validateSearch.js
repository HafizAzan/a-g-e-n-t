/**
 * validateSearch.js — validate POST /api/search body.
 */
import { badRequest } from "../errors/AppError.js";

const REQUIRED_STRINGS = ["businessType", "country", "state", "city"];

export function validateSearchInput(req, res, next) {
  const body = req.body || {};
  const errors = [];

  for (const field of REQUIRED_STRINGS) {
    if (!body[field] || String(body[field]).trim() === "") {
      errors.push(`${field} is required`);
    }
  }

  const radius = Number(body.radius);
  if (!Number.isFinite(radius) || radius < 1) {
    errors.push("radius must be a number >= 1");
  }

  const maximumResults = Number(body.maximumResults);
  if (!Number.isFinite(maximumResults) || maximumResults < 1) {
    errors.push("maximumResults must be a number >= 1");
  }

  const minimumRating = Number(body.minimumRating);
  if (
    !Number.isFinite(minimumRating) ||
    minimumRating < 0 ||
    minimumRating > 5
  ) {
    errors.push("minimumRating must be a number between 0 and 5");
  }

  if (body.hasWebsite && body.noWebsite) {
    errors.push("Choose either hasWebsite or noWebsite, not both");
  }

  if (errors.length > 0) {
    return next(badRequest("Validation failed", errors));
  }

  req.body = {
    ...body,
    businessType: String(body.businessType).trim(),
    country: String(body.country).trim(),
    state: String(body.state).trim(),
    city: String(body.city).trim(),
    radius,
    maximumResults,
    minimumRating,
    hasWebsite: Boolean(body.hasWebsite),
    noWebsite: Boolean(body.noWebsite),
    onlyPoorWebsite: Boolean(body.onlyPoorWebsite),
    onlyVerified: Boolean(body.onlyVerified),
  };

  next();
}
