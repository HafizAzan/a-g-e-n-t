/**
 * google.js — Google Places API config.
 */
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

export function getGoogleConfig() {
  const configured = Boolean(env.googleMapsApiKey);

  if (!configured) {
    logger.warn("Google Maps API key missing. Places calls will be stubbed.");
  }

  return {
    apiKey: env.googleMapsApiKey,
    configured,
    nearbySearchUrl: `${PLACES_BASE}/nearbysearch/json`,
    textSearchUrl: `${PLACES_BASE}/textsearch/json`,
    placeDetailsUrl: `${PLACES_BASE}/details/json`,
    minDelayMs: Number(process.env.GOOGLE_PLACES_MIN_DELAY_MS) || 200,
    pageTokenDelayMs: Number(process.env.GOOGLE_PLACES_PAGE_DELAY_MS) || 2000,
    maxPages: 3,
  };
}
