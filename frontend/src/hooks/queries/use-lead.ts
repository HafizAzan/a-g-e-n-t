/**
 * use-lead.ts — GET /api/lead/:id
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getLead } from "@/api/lead.api";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useLead(leadId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leads.detail(leadId || ""),
    queryFn: () => getLead(leadId as string),
    enabled: Boolean(leadId),
  });
}
