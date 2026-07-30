/**
 * use-searches.ts — GET /api/search (list)
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { listSearches } from "@/api/search.api";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useSearches() {
  return useQuery({
    queryKey: queryKeys.searches.all,
    queryFn: listSearches,
  });
}
