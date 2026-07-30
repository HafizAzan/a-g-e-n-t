import { History } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { SearchCard } from "@/features/dashboard/search-card";
import { sectionTitle } from "@/lib/ui-classes";
import type { SearchRun } from "@/types/search";

type RecentSearchesProps = {
  searches: SearchRun[];
};

/**
 * RecentSearches
 * Purpose: grid of recent AI search runs on the Dashboard.
 */
export function RecentSearches({ searches }: RecentSearchesProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className={sectionTitle}>Recent Searches</h2>
        <p className="text-sm text-muted-foreground">
          Jump back into a run or check live progress.
        </p>
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={History}
          title="No searches yet"
          description="Start your first AI search to find leads."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {searches.map((search) => (
            <SearchCard key={search.id} search={search} />
          ))}
        </div>
      )}
    </section>
  );
}
