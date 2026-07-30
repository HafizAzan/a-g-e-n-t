/**
 * use-leads.ts — list leads
 *
 * - No searchId → GET /api/leads (all)
 * - With searchId → GET /api/search/:id/leads
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { listLeads } from "@/api/lead.api";
import { getSearchLeads } from "@/api/search.api";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useLeads(searchId?: string) {
  return useQuery({
    queryKey: searchId
      ? queryKeys.searches.leads(searchId)
      : queryKeys.leads.all,
    queryFn: () =>
      searchId ? getSearchLeads(searchId) : listLeads(),
  });
}
