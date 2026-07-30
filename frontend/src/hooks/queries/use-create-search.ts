/**
 * use-create-search.ts — POST /api/search
 *
 * On success: invalidate search lists so dashboard stays fresh.
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSearch,
  type CreateSearchPayload,
} from "@/api/search.api";
import { queryKeys } from "@/hooks/queries/query-keys";

export function useCreateSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSearchPayload) => createSearch(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.searches.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });

      // Prefetch the new search status into cache
      if (result.searchId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.searches.detail(result.searchId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.searches.leads(result.searchId),
        });
      }
    },
  });
}
