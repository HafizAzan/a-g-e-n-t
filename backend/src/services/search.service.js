/**
 * search.service.js
 *
 * POST /api/search flow:
 *   Save Search → Google Places → Businesses → Save DB → Return
 *
 * (Website / contacts / AI come in later steps.)
 */
import * as searchRepository from "../repositories/search.repository.js";
import * as leadRepository from "../repositories/lead.repository.js";
import * as googleService from "./google.service.js";
import { removeDuplicateBusinesses } from "../utils/dedupe.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../errors/AppError.js";

function buildQueryLabel(criteria) {
  const parts = [
    criteria.businessType,
    criteria.city,
    criteria.state,
    criteria.country,
  ].filter(Boolean);
  return parts.join(" · ");
}

/**
 * Sync pipeline: Places → businesses → leads saved → response.
 */
export async function startSearch(criteria) {
  // 1. Save Search
  const search = await searchRepository.createSearch({
    query: buildQueryLabel(criteria),
    city: criteria.city || "",
    country: criteria.country || "",
    status: "running",
    totalFound: 0,
    criteria,
  });

  try {
    // 2. Google Places
    const placesResponse = await googleService.searchPlaces(criteria);

    // 3. Businesses (map + dedupe + filters)
    let businesses = googleService.collectBusinesses(
      placesResponse,
      criteria
    );
    businesses = removeDuplicateBusinesses(businesses);
    businesses = businesses.slice(0, criteria.maximumResults || 50);
    businesses = businesses.filter(
      (b) => (b.rating || 0) >= (criteria.minimumRating || 0)
    );

    logger.info(
      `Search ${search.id}: ${businesses.length} businesses after Places/dedupe/filter`
    );

    // 4. Save DB (leads)
    let savedCount = 0;
    for (const business of businesses) {
      await leadRepository.saveLead({
        ...business,
        websiteStatus: business.website ? "unknown" : "none",
        leadScore: 0,
        aiNotes: [],
        searchId: search.id,
      });
      savedCount += 1;
    }

    await searchRepository.updateSearch(search.id, {
      status: "completed",
      totalFound: savedCount,
    });

    // 5. Return
    return {
      searchId: search.id,
      status: "completed",
      totalFound: savedCount,
    };
  } catch (error) {
    logger.error(`Search pipeline failed: ${search.id}`, error.message);
    await searchRepository.updateSearch(search.id, { status: "failed" });

    throw new AppError(
      error.message || "Search pipeline failed",
      502,
      "SEARCH_PIPELINE_FAILED"
    );
  }
}

export async function listSearches() {
  return searchRepository.listSearches();
}

export async function getSearchStatus(searchId) {
  const search = await searchRepository.findSearchById(searchId);
  if (!search) return null;

  const leads = await leadRepository.findLeadsBySearchId(searchId);

  return {
    id: search.id,
    query: search.query,
    city: search.city,
    country: search.country,
    status: search.status,
    totalFound: search.totalFound ?? leads.length,
    createdAt: search.createdAt,
    leadCount: leads.length,
  };
}

export async function deleteSearch(searchId) {
  const existing = await searchRepository.findSearchById(searchId);
  if (!existing) return null;

  await leadRepository.deleteBySearchId(searchId);
  await searchRepository.deleteSearch(searchId);

  return { id: searchId, deleted: true };
}

export { buildQueryLabel };
