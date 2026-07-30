"use client";

import { LatestLeads } from "@/features/dashboard/latest-leads";
import { QuickSearch } from "@/features/dashboard/quick-search";
import { RecentSearches } from "@/features/dashboard/recent-searches";
import { StatisticsSection } from "@/features/dashboard/statistics-section";
import { WelcomeHeader } from "@/features/dashboard/welcome-header";
import { useLeads, useSearches } from "@/hooks/queries";
import {
  buildDashboardStats,
  toResultLead,
  toSearchRun,
} from "@/lib/map-lead";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/api/axios";

/**
 * DashboardView — loads real searches + leads from the API.
 */
export function DashboardView() {
  const searchesQuery = useSearches();
  const leadsQuery = useLeads();

  const isLoading = searchesQuery.isLoading || leadsQuery.isLoading;
  const error = searchesQuery.error || leadsQuery.error;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <WelcomeHeader userName="Azan" />
        <QuickSearch />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <WelcomeHeader userName="Azan" />
        <QuickSearch />
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not load dashboard: {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  const searches = (searchesQuery.data || []).map(toSearchRun);
  const leads = (leadsQuery.data || []).slice(0, 5).map(toResultLead);
  const stats = buildDashboardStats(
    searchesQuery.data || [],
    leadsQuery.data?.length || 0
  );

  return (
    <div className="space-y-8 md:space-y-10">
      <WelcomeHeader userName="Azan" />
      <QuickSearch />
      <StatisticsSection stats={stats} />
      <RecentSearches searches={searches} />
      <LatestLeads leads={leads} />
    </div>
  );
}
