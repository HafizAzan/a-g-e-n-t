/**
 * search.api.ts
 * Purpose: HTTP calls for /api/search
 */
import { api, type ApiSuccess } from "@/api/axios";
import type { NewSearchFormValues } from "@/types/new-search";

/** Body for POST /api/search (same shape as the form) */
export type CreateSearchPayload = NewSearchFormValues;

export type CreateSearchResult = {
  searchId: string;
  status: string;
  totalFound?: number;
};

export type SearchStatus = {
  id: string;
  query: string;
  city: string;
  country: string;
  status: string;
  totalFound: number;
  createdAt?: string;
  leadCount: number;
};

/** POST /api/search — Places → save leads → return ids */
export async function createSearch(payload: CreateSearchPayload) {
  const { data } = await api.post<ApiSuccess<CreateSearchResult>>(
    "/api/search",
    payload
  );
  return data.data;
}

/** GET /api/search */
export async function listSearches() {
  const { data } = await api.get<ApiSuccess<SearchStatus[]>>("/api/search");
  return data.data;
}

/** GET /api/search/:id */
export async function getSearch(searchId: string) {
  const { data } = await api.get<ApiSuccess<SearchStatus>>(
    `/api/search/${searchId}`
  );
  return data.data;
}

/** GET /api/search/:id/leads */
export async function getSearchLeads(searchId: string) {
  const { data } = await api.get<ApiSuccess<LeadDto[]>>(
    `/api/search/${searchId}/leads`
  );
  return data.data;
}

/** DELETE /api/search/:id */
export async function deleteSearch(searchId: string) {
  const { data } = await api.delete<
    ApiSuccess<{ id: string; deleted: boolean }>
  >(`/api/search/${searchId}`);
  return data.data;
}

/** Lead shape returned by the backend (camelCase) */
export type LeadDto = {
  id: string;
  searchId?: string;
  businessName: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  websiteStatus?: string;
  leadScore?: number;
  address?: string;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
  aiNotes?: string[];
  city?: string;
  country?: string;
  createdAt?: string;
};
