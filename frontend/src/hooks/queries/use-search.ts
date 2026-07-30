/**
 * use-search.ts — GET /api/search/:id
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getSearch } from "@/api/search.api";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useSearch(searchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.searches.detail(searchId || ""),
    queryFn: () => getSearch(searchId as string),
    enabled: Boolean(searchId),
  });
}
