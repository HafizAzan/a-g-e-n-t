/**
 * google.service.js
 * Purpose: Google Places only (no AI).
 *
 * Owns: Nearby Search | Text Search | Place Details | Pagination | Rate limit
 * No key → stub results so the pipeline still runs locally.
 */
import { getGoogleConfig } from "../config/google.js";
import { logger } from "../utils/logger.js";
import { createId, sleep } from "../utils/helpers.js";

let lastCallAt = 0;
/** @type {Promise<void>} */
let queueTail = Promise.resolve();

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {number} [extraDelayMs]
 */
function withRateLimit(fn, extraDelayMs = 0) {
  const { minDelayMs } = getGoogleConfig();

  const run = queueTail.then(async () => {
    const waitForGap = Math.max(0, minDelayMs - (Date.now() - lastCallAt));
    const totalWait = waitForGap + extraDelayMs;
    if (totalWait > 0) await sleep(totalWait);
    lastCallAt = Date.now();
    return fn();
  });

  queueTail = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

/**
 * @param {string} url
 * @param {Record<string, string|number|undefined|null>} params
 * @param {number} [extraDelayMs]
 */
async function placesGet(url, params, extraDelayMs = 0) {
  const { apiKey, configured } = getGoogleConfig();
  if (!configured) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  return withRateLimit(async () => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      searchParams.set(key, String(value));
    }
    searchParams.set("key", apiKey);

    const response = await fetch(`${url}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Places HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      logger.error("Places API error", {
        status: data.status,
        message: data.error_message,
      });
      throw new Error(
        `Places API ${data.status}: ${data.error_message || "unknown error"}`
      );
    }

    return data;
  }, extraDelayMs);
}

const DEFAULT_DETAIL_FIELDS = [
  "place_id",
  "name",
  "formatted_address",
  "formatted_phone_number",
  "international_phone_number",
  "website",
  "url",
  "rating",
  "user_ratings_total",
  "types",
  "geometry",
  "business_status",
].join(",");

export async function getPlaceDetails(
  placeId,
  fields = DEFAULT_DETAIL_FIELDS
) {
  const { placeDetailsUrl } = getGoogleConfig();
  const data = await placesGet(placeDetailsUrl, {
    place_id: placeId,
    fields,
  });
  return data.result || null;
}

export async function nearbySearch(options) {
  const { nearbySearchUrl, pageTokenDelayMs } = getGoogleConfig();
  const extraDelay = options.pageToken ? pageTokenDelayMs : 0;

  return placesGet(
    nearbySearchUrl,
    {
      location: `${options.lat},${options.lng}`,
      radius: Math.min(Math.max(1, options.radiusMeters), 50000),
      keyword: options.keyword,
      type: options.type,
      pagetoken: options.pageToken,
    },
    extraDelay
  );
}

export async function textSearch(options) {
  const { textSearchUrl, pageTokenDelayMs } = getGoogleConfig();
  const extraDelay = options.pageToken ? pageTokenDelayMs : 0;

  /** @type {Record<string, string|number|undefined>} */
  const params = {
    query: options.query,
    pagetoken: options.pageToken,
  };

  if (
    Number.isFinite(options.lat) &&
    Number.isFinite(options.lng) &&
    options.radiusMeters
  ) {
    params.location = `${options.lat},${options.lng}`;
    params.radius = Math.min(Math.max(1, options.radiusMeters), 50000);
  }

  return placesGet(textSearchUrl, params, extraDelay);
}

/**
 * @param {(pageToken?: string) => Promise<{ results?: object[], next_page_token?: string }>} fetchPage
 * @param {number} [maxResults]
 */
export async function paginatePlaces(fetchPage, maxResults = 60) {
  const { maxPages } = getGoogleConfig();
  /** @type {object[]} */
  const all = [];
  let pageToken;

  for (let page = 0; page < maxPages && all.length < maxResults; page += 1) {
    const data = await fetchPage(pageToken);
    all.push(...(data.results || []));
    pageToken = data.next_page_token;
    if (!pageToken) break;
  }

  return all.slice(0, maxResults);
}

function stubPlacesResponse(criteria) {
  const type = criteria.businessType || "establishment";
  const city = criteria.city || "City";

  return {
    status: "OK_STUB_NO_KEY",
    results: [
      {
        place_id: createId("place"),
        name: `${type} One`,
        formatted_phone_number: "+1 555 0101",
        website: "https://example-one.test",
        rating: 4.6,
        user_ratings_total: 120,
        vicinity: `123 Main St, ${city}`,
        types: [type],
      },
      {
        place_id: createId("place"),
        name: `${type} Two`,
        formatted_phone_number: "+1 555 0102",
        website: "",
        rating: 3.9,
        user_ratings_total: 18,
        vicinity: `45 Oak Ave, ${city}`,
        types: [type],
      },
      {
        place_id: createId("place"),
        name: `${type} One`,
        formatted_phone_number: "+1 555 0101",
        website: "https://example-one.test",
        rating: 4.6,
        user_ratings_total: 120,
        vicinity: `123 Main St, ${city}`,
        types: [type],
      },
      {
        place_id: createId("place"),
        name: `${type} Three`,
        formatted_phone_number: "+1 555 0103",
        website: "https://short.test",
        rating: 4.1,
        user_ratings_total: 44,
        vicinity: `9 Pine Rd, ${city}`,
        types: [type],
      },
    ],
  };
}

export function buildGoogleMapsUrl(place) {
  if (place.url) return place.url;
  if (place.place_id) {
    return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
  }
  const query = encodeURIComponent(
    `${place.name || ""} ${place.vicinity || place.formatted_address || ""}`.trim()
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Text or Nearby → paginate → Place Details.
 */
export async function searchPlaces(criteria) {
  const { configured } = getGoogleConfig();
  const maxResults = Math.min(criteria.maximumResults || 20, 60);

  logger.info("google.service.searchPlaces", {
    configured,
    city: criteria.city,
    businessType: criteria.businessType,
    maxResults,
  });

  if (!configured) {
    return stubPlacesResponse(criteria);
  }

  const radiusMeters = Number(criteria.radius) || 5000;
  const hasCoords =
    Number.isFinite(criteria.lat) && Number.isFinite(criteria.lng);

  /** @type {object[]} */
  let listResults;

  if (hasCoords) {
    listResults = await paginatePlaces(
      (pageToken) =>
        nearbySearch({
          lat: criteria.lat,
          lng: criteria.lng,
          radiusMeters,
          keyword: criteria.businessType,
          pageToken,
        }),
      maxResults
    );
  } else {
    const query = [
      criteria.businessType,
      "in",
      criteria.city,
      criteria.state,
      criteria.country,
    ]
      .filter(Boolean)
      .join(" ");

    listResults = await paginatePlaces(
      (pageToken) =>
        textSearch({
          query,
          lat: criteria.lat,
          lng: criteria.lng,
          radiusMeters,
          pageToken,
        }),
      maxResults
    );
  }

  const details = [];
  for (const place of listResults.slice(0, maxResults)) {
    if (!place.place_id) continue;
    try {
      const detail = await getPlaceDetails(place.place_id);
      details.push(detail ? { ...place, ...detail } : place);
    } catch (error) {
      logger.warn("Place Details failed; using list result", {
        placeId: place.place_id,
        message: error.message,
      });
      details.push(place);
    }
  }

  return {
    status: details.length ? "OK" : "ZERO_RESULTS",
    results: details,
  };
}

/** Map Places payload → lead-shaped objects (no scoring). */
export function collectBusinesses(placesResponse, criteria) {
  const results = placesResponse?.results || [];

  return results.map((place) => ({
    placeId: place.place_id,
    businessName: place.name,
    category: criteria.businessType || place.types?.[0] || "",
    phone:
      place.formatted_phone_number ||
      place.international_phone_number ||
      "",
    website: place.website || "",
    address: place.formatted_address || place.vicinity || "",
    rating: place.rating ?? 0,
    reviewCount: place.user_ratings_total ?? 0,
    googleMapsUrl: buildGoogleMapsUrl(place),
    city: criteria.city,
    country: criteria.country,
  }));
}
