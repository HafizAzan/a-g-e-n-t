import { Download, Radar, Search, Users } from "lucide-react";
import { StatCard } from "@/components/data-display/stat-card";
import { sectionTitle } from "@/lib/ui-classes";
import type { DashboardStats } from "@/types/dashboard";

type StatisticsSectionProps = {
  stats: DashboardStats;
};

/**
 * StatisticsSection
 * Purpose: four key metrics for the Dashboard overview.
 */
export function StatisticsSection({ stats }: StatisticsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className={sectionTitle}>Statistics</h2>
        <p className="text-sm text-muted-foreground">
          A snapshot of your Lead Finder activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total searches"
          value={stats.totalSearches}
          hint="All time"
          icon={Search}
        />
        <StatCard
          label="Leads found"
          value={stats.leadsFound}
          hint="Across every search"
          icon={Users}
        />
        <StatCard
          label="Active runs"
          value={stats.activeRuns}
          hint="Currently searching"
          icon={Radar}
        />
        <StatCard
          label="Exports this week"
          value={stats.exportsThisWeek}
          hint="Last 7 days"
          icon={Download}
        />
      </div>
    </section>
  );
}
