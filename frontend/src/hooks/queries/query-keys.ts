/**
 * query-keys.ts
 * Purpose: one place for React Query cache keys (avoids typos).
 */
export const queryKeys = {
  searches: {
    all: ["searches"] as const,
    detail: (searchId: string) => ["searches", searchId] as const,
    leads: (searchId: string) => ["searches", searchId, "leads"] as const,
  },
  leads: {
    all: ["leads"] as const,
    detail: (leadId: string) => ["leads", leadId] as const,
  },
};
