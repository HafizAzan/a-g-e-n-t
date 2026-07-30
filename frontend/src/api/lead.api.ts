/**
 * lead.api.ts
 * Purpose: HTTP calls for /api/lead and /api/leads
 */
import { api, type ApiSuccess } from "@/api/axios";
import type { LeadDto } from "@/api/search.api";

/** GET /api/leads — all leads */
export async function listLeads() {
  const { data } = await api.get<ApiSuccess<LeadDto[]>>("/api/leads");
  return data.data;
}

/** GET /api/lead/:id — one lead */
export async function getLead(leadId: string) {
  const { data } = await api.get<ApiSuccess<LeadDto>>(`/api/lead/${leadId}`);
  return data.data;
}
